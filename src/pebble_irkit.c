#include <pebble.h>

static Window *s_window;
static GRect s_window_bounds;
static MenuLayer *s_menu_layer;
static TextLayer *s_text_layer;

#ifdef PBL_SDK_3
static StatusBarLayer *s_status_bar;
static Layer *s_battery_layer;
#endif

static uint16_t s_num_command;
static char **s_command_names;

#define MAX_COMMAND_NAME_BYTE 32
#define MAX_COMMANDS 16
#define NUM_MENU_SECTIONS 1

enum {
  MSG_KEY_MENU_ITEM = 0, // 0,1,2,...,MAX_COMMANDS-1
  MSG_KEY_MENU_STATE = 127,
  MSG_KEY_COMMAND_INDEX = 128,
  MSG_KEY_COMMAND_RESULT = 129,
};

enum {
  MENU_LOADING = 1,
  MENU_FAILED = -1,
};

// --------------------------------------------------------
// Command

void commands_init() {
  s_num_command = 0;
  s_command_names = (char **)malloc(sizeof(char *) * MAX_COMMANDS);
  memset(s_command_names, 0, sizeof(char *) * MAX_COMMANDS);
}

void commands_destroy() {
  if (s_command_names) {
    for (int i = 0; i < MAX_COMMANDS; i++) {
      if (s_command_names[i]) {
        free(s_command_names[i]);
      }
    }
    free(s_command_names);
    s_command_names = NULL;
  }
}

void commands_init_array() {
  s_num_command = 0;
  for (int i = 0; i < MAX_COMMANDS; i++) {
    char *command_name = s_command_names[i];
    if (command_name) {
      free(command_name);
    }
    command_name = (char *)malloc(MAX_COMMAND_NAME_BYTE + 1);
    memset(command_name, 0, MAX_COMMAND_NAME_BYTE + 1);
    s_command_names[i] = command_name;
  }
}

// --------------------------------------------------------
// Toast: popup text

static void toast_init() {
  const int16_t toast_height = 25;
  GRect toast_bounds = GRect(
    s_window_bounds.origin.x,
    s_window_bounds.size.h - toast_height,
    s_window_bounds.size.w,
    toast_height
  );
  s_text_layer = text_layer_create(toast_bounds);
  text_layer_set_background_color(s_text_layer, GColorBlack);
  text_layer_set_text_color(s_text_layer, GColorWhite);
  text_layer_set_text_alignment(s_text_layer, GTextAlignmentCenter);
  layer_set_hidden((Layer *)s_text_layer, true);
  Layer *window_layer = window_get_root_layer(s_window);
  layer_add_child(window_layer, text_layer_get_layer(s_text_layer));
}

static void toast_show(const char *text) {
  text_layer_set_text(s_text_layer, text);
  layer_set_hidden((Layer *)s_text_layer, false);
}

static void toast_hide() {
  layer_set_hidden((Layer *)s_text_layer, true);
}

static void toast_deinit() {
  text_layer_destroy(s_text_layer);
  s_text_layer = NULL;
}

// --------------------------------------------------------
// Communicate

void send_selected_command(int index) {
  DictionaryIterator *iter;
  app_message_outbox_begin(&iter);
  if (iter == NULL) {
    return;
  }
  dict_write_uint8(iter, MSG_KEY_COMMAND_INDEX, index);
  dict_write_end(iter);
  app_message_outbox_send();
}

void out_sent_handler(DictionaryIterator *sent, void *context) {
  // outgoing message was delivered
}

void out_failed_handler(DictionaryIterator *failed, AppMessageResult reason, void *context) {
  // outgoing message failed
}

void in_received_handler(DictionaryIterator *received, void *context) {
  // incoming message received
  Tuple *tuple = NULL;

  // menu items
  if ((tuple = dict_find(received, MSG_KEY_MENU_ITEM))) {
    commands_init_array();
    for (uint32_t i = 0; i < MAX_COMMANDS; i++) {
      Tuple *text_tuple = dict_find(received, MSG_KEY_MENU_ITEM + i);
      if (text_tuple) {
        strncpy(s_command_names[i], text_tuple->value->cstring, MAX_COMMAND_NAME_BYTE);
        s_num_command = i + 1;
      }
    }
    menu_layer_reload_data(s_menu_layer);
    if (s_num_command > 0) {
      toast_hide();
    } else {
      toast_show("command not found");
    }
  } else if ((tuple = dict_find(received, MSG_KEY_MENU_STATE))) { // menu state
    int state = (int)tuple->value->int32;
    APP_LOG(APP_LOG_LEVEL_INFO, "MenuState %d", state);
    if (state == MENU_LOADING) {
      toast_show("loading...");
    } else if (state == MENU_FAILED) {
      toast_show("command not found");
    }
  } else if ((tuple = dict_find(received, MSG_KEY_COMMAND_RESULT))) { // send command result
    APP_LOG(APP_LOG_LEVEL_INFO, "CommandResult %d", (int)tuple->value->int32);
    if (tuple->value->int32) {
      vibes_short_pulse();
    }
  }
}

void in_dropped_handler(AppMessageResult reason, void *context) {
   // incoming message dropped
 }

static void message_init() {
  app_message_register_inbox_received(in_received_handler);
  app_message_register_inbox_dropped(in_dropped_handler);
  app_message_register_outbox_sent(out_sent_handler);
  app_message_register_outbox_failed(out_failed_handler);
  const uint32_t inbound_size = 512;
  const uint32_t outbound_size = 64;
  app_message_open(inbound_size, outbound_size);
}

// --------------------------------------------------------
// Menu

static uint16_t menu_get_num_sections_callback(MenuLayer *menu_layer, void *context) {
  return NUM_MENU_SECTIONS;
}

static uint16_t menu_get_num_rows_callback(MenuLayer *menu_layer, uint16_t section_index, void *context) {
  return s_num_command;
}

static int16_t menu_get_header_height_callback(MenuLayer *menu_layer, uint16_t section_index, void *context) {
  // This is a define provided in pebble.h that you may use for the default height
  return MENU_CELL_BASIC_HEADER_HEIGHT;
}

static void menu_draw_header_callback(GContext* ctx, const Layer *cell_layer, uint16_t section_index, void *context) {
  switch (section_index) {
    case 0:
      menu_cell_basic_header_draw(ctx, cell_layer, "Commands");
      break;
  }
}

static void menu_draw_row_callback(GContext* ctx, const Layer *cell_layer, MenuIndex *cell_index, void *context) {
  switch (cell_index->section) {
    case 0:
      menu_cell_basic_draw(ctx, cell_layer, s_command_names[cell_index->row], NULL, NULL);
      break;
  }
}

void menu_select_callback(MenuLayer *menu_layer, MenuIndex *cell_index, void *callback_context) {
  APP_LOG(APP_LOG_LEVEL_INFO, "MenuSelected section:%d row:%d", cell_index->section, cell_index->row);
  if (cell_index->section == 0) {
    send_selected_command(cell_index->row);
  }
}

static void menu_init(Window *window) {
  Layer *window_layer = window_get_root_layer(window);
#ifdef PBL_SDK_3
  GRect menu_bound = GRect(
    s_window_bounds.origin.x,
    s_window_bounds.origin.y + STATUS_BAR_LAYER_HEIGHT,
    s_window_bounds.size.w,
    s_window_bounds.size.h - STATUS_BAR_LAYER_HEIGHT
  );
  s_menu_layer = menu_layer_create(menu_bound);
#else
  s_menu_layer = menu_layer_create(s_window_bounds);
#endif

  menu_layer_set_callbacks(s_menu_layer, NULL, (MenuLayerCallbacks){
    .get_num_sections = menu_get_num_sections_callback,
    .get_num_rows = menu_get_num_rows_callback,
    .get_header_height = menu_get_header_height_callback,
    .draw_header = menu_draw_header_callback,
    .draw_row = menu_draw_row_callback,
    .select_click = menu_select_callback,
  });

  menu_layer_set_click_config_onto_window(s_menu_layer, window);
  layer_add_child(window_layer, menu_layer_get_layer(s_menu_layer));

#ifdef PBL_COLOR
  menu_layer_set_highlight_colors(s_menu_layer, GColorCyan, GColorBlack);
#endif
}

static void menu_deinit() {
  menu_layer_destroy(s_menu_layer);
  s_menu_layer = NULL;
}

// --------------------------------------------------------
// Status Bar

#ifdef PBL_SDK_3
static void battery_proc(Layer *layer, GContext *ctx) {
  // Emulator battery meter on Aplite
  graphics_context_set_stroke_color(ctx, GColorWhite);
  graphics_draw_rect(ctx, GRect(126, 4, 14, 8));
  graphics_draw_line(ctx, GPoint(140, 6), GPoint(140, 9));

  BatteryChargeState state = battery_state_service_peek();
  int width = (int)(float)(((float)state.charge_percent / 100.0F) * 10.0F);
  graphics_context_set_fill_color(ctx, GColorWhite);
  graphics_fill_rect(ctx, GRect(128, 6, width, 4), 0, GCornerNone);
}
#endif

static void status_bar_init(Window *window) {
#ifdef PBL_SDK_3
  Layer *window_layer = window_get_root_layer(window);
  GRect status_bar_bounds = GRect(s_window_bounds.origin.x, s_window_bounds.origin.y, s_window_bounds.size.w, STATUS_BAR_LAYER_HEIGHT);

  // Set up the status bar last to ensure it is on top of other Layers
  s_status_bar = status_bar_layer_create();
  layer_add_child(window_layer, status_bar_layer_get_layer(s_status_bar));

  // Show legacy battery meter
  s_battery_layer = layer_create(status_bar_bounds);
  layer_set_update_proc(s_battery_layer, battery_proc);
  layer_add_child(window_layer, s_battery_layer);
#endif
}

// --------------------------------------------------------
// Window

static void window_load(Window *window) {
  Layer *window_layer = window_get_root_layer(window);
  s_window_bounds = layer_get_bounds(window_layer);

  message_init();
  menu_init(window);
  status_bar_init(window);
  toast_init();
  toast_show("loading...");
}

static void window_unload(Window *window) {
  menu_deinit();
  toast_deinit();
}

// --------------------------------------------------------
// App

static void init(void) {
  commands_init();
  s_window = window_create();
  // window_set_click_config_provider(window, click_config_provider);
  window_set_window_handlers(s_window, (WindowHandlers) {
    .load = window_load,
    .unload = window_unload,
  });
  const bool animated = true;
  window_stack_push(s_window, animated);
}

static void deinit(void) {
  window_destroy(s_window);
  commands_destroy();
}

int main(void) {
  init();

  APP_LOG(APP_LOG_LEVEL_INFO, "Done initializing, pushed window: %p", s_window);

  app_event_loop();
  deinit();
}
