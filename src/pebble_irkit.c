#include <pebble.h>

Window *g_window;
MenuLayer *g_menu_layer;

uint16_t g_num_command;
char **g_command_names;

#define MAX_COMMAND_NAME_BYTE 32
#define MAX_COMMANDS 16
#define NUM_MENU_SECTIONS 1

void commands_init() {
  g_num_command = 0;
  g_command_names = (char **)malloc(sizeof(char *) * MAX_COMMANDS);
  memset(g_command_names, 0, sizeof(char *) * MAX_COMMANDS);
}

void commands_destroy() {
  if (g_command_names) {
    for (int i = 0; i < MAX_COMMANDS; i++) {
      if (g_command_names[i]) {
        free(g_command_names[i]);
      }
    }
    free(g_command_names);
    g_command_names = NULL;
  }
}

void commands_init_array() {
  g_num_command = 0;
  for (int i = 0; i < MAX_COMMANDS; i++) {
    char *command_name = g_command_names[i];
    if (command_name) {
      free(command_name);
    }
    command_name = (char *)malloc(MAX_COMMAND_NAME_BYTE + 1);
    memset(command_name, 0, MAX_COMMAND_NAME_BYTE + 1);
    g_command_names[i] = command_name;
  }
}

// --------------------------------------------------------
// Message

void out_sent_handler(DictionaryIterator *sent, void *context) {
  // outgoing message was delivered
}

void out_failed_handler(DictionaryIterator *failed, AppMessageResult reason, void *context) {
  // outgoing message failed
}

void in_received_handler(DictionaryIterator *received, void *context) {
  // incoming message received
  commands_init_array();
  for (uint32_t i = 0; i < MAX_COMMANDS; i++) {
    Tuple *text_tuple = dict_find(received, i);
    if (text_tuple) {
      strncpy(g_command_names[i], text_tuple->value->cstring, MAX_COMMAND_NAME_BYTE);
      g_num_command = i + 1;
    }
  }
  menu_layer_reload_data(g_menu_layer);
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

static uint16_t menu_get_num_sections_callback(MenuLayer *menu_layer, void *data) {
  return NUM_MENU_SECTIONS;
}

static uint16_t menu_get_num_rows_callback(MenuLayer *menu_layer, uint16_t section_index, void *data) {
  return g_num_command;
}

static int16_t menu_get_header_height_callback(MenuLayer *menu_layer, uint16_t section_index, void *data) {
  // This is a define provided in pebble.h that you may use for the default height
  return MENU_CELL_BASIC_HEADER_HEIGHT;
}

static void menu_draw_header_callback(GContext* ctx, const Layer *cell_layer, uint16_t section_index, void *data) {
  switch (section_index) {
    case 0:
      menu_cell_basic_header_draw(ctx, cell_layer, "Commands");
      break;
  }
}

static void menu_draw_row_callback(GContext* ctx, const Layer *cell_layer, MenuIndex *cell_index, void *data) {
  switch (cell_index->section) {
    case 0:
      menu_cell_basic_draw(ctx, cell_layer, g_command_names[cell_index->row], NULL, NULL);
//       menu_cell_basic_draw(ctx, cell_layer, "Basic Item", "With a subtitle", NULL);

    //   // Use the row to specify which item we'll draw
    //   switch (cell_index->row) {
    //     case 0:
    //       // This is a basic menu item with a title and subtitle
    //       menu_cell_basic_draw(ctx, cell_layer, "Basic Item", "With a subtitle", NULL);
    //       break;
      //
    //     case 1:
    //       // This is a basic menu icon with a cycling icon
    //       menu_cell_basic_draw(ctx, cell_layer, "Icon Item", "Select to cycle", menu_icons[current_icon]);
    //       break;
      //
    //     case 2:
    //       // Here we use the graphics context to draw something different
    //       // In this case, we show a strip of a watchface's background
    //       graphics_draw_bitmap_in_rect(ctx, menu_background,
    //           (GRect){ .origin = GPointZero, .size = layer_get_frame((Layer*) cell_layer).size });
    //       break;
    //   }
      break;
  }
}

void menu_select_callback(MenuLayer *menu_layer, MenuIndex *cell_index, void *data) {
  // TODO: send cell_index to Javascript Framework
}

static void menu_init(Window *window) {
  Layer *window_layer = window_get_root_layer(window);
  GRect bounds = layer_get_bounds(window_layer);
  g_menu_layer = menu_layer_create(bounds);

  menu_layer_set_callbacks(g_menu_layer, NULL, (MenuLayerCallbacks){
    .get_num_sections = menu_get_num_sections_callback,
    .get_num_rows = menu_get_num_rows_callback,
    .get_header_height = menu_get_header_height_callback,
    .draw_header = menu_draw_header_callback,
    .draw_row = menu_draw_row_callback,
    .select_click = menu_select_callback,
  });

  menu_layer_set_click_config_onto_window(g_menu_layer, window);
  layer_add_child(window_layer, menu_layer_get_layer(g_menu_layer));
}

// --------------------------------------------------------
//

// static void select_click_handler(ClickRecognizerRef recognizer, void *context) {
//   text_layer_set_text(text_layer, "Select");
// }
//
// static void up_click_handler(ClickRecognizerRef recognizer, void *context) {
//   text_layer_set_text(text_layer, "Up");
// }
//
// static void down_click_handler(ClickRecognizerRef recognizer, void *context) {
//   text_layer_set_text(text_layer, "Down");
// }
//
// static void click_config_provider(void *context) {
//   window_single_click_subscribe(BUTTON_ID_SELECT, select_click_handler);
//   window_single_click_subscribe(BUTTON_ID_UP, up_click_handler);
//   window_single_click_subscribe(BUTTON_ID_DOWN, down_click_handler);
// }

// --------------------------------------------------------
// Window

static void window_load(Window *window) {
  message_init();
  menu_init(window);
}

static void window_unload(Window *window) {
  menu_layer_destroy(g_menu_layer);
}

// --------------------------------------------------------
// App

static void init(void) {
  commands_init();
  g_window = window_create();
  // window_set_click_config_provider(window, click_config_provider);
  window_set_window_handlers(g_window, (WindowHandlers) {
    .load = window_load,
    .unload = window_unload,
  });
  const bool animated = true;
  window_stack_push(g_window, animated);
}

static void deinit(void) {
  window_destroy(g_window);
  commands_destroy();
}

int main(void) {
  init();

  APP_LOG(APP_LOG_LEVEL_INFO, "Done initializing, pushed window: %p", g_window);

  app_event_loop();
  deinit();
}
