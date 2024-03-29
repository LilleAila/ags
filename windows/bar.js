import {
	GLib,
	App,
	Service,
	Utils,
	Variable,
	Widget,
	Audio,
	Battery,
	Bluetooth,
	Hyprland,
	Mpris,
	Network,
	Notifications,
	PowerProfiles,
	SystemTray,
} from "../imports.js";
import Gdk from "gi://Gdk"

const date = Variable('', {
	poll: [1000, 'date +"%H:%M"'],
});
const full_date = Variable('', {
	// poll: [1000, 'date +"%Y-%m-%d %H:%M"'],
	poll: [1000, 'date +"%A %d. %B %y, Uke %V %H:%M"'],
});
const Date = () => Widget.Label({
	label: date.bind(),
	"tooltip-text": full_date.bind().transform(text =>
		text.charAt(0).toUpperCase() + text.slice(1)
	),
	class_name: "date",
});

const Workspaces = () => Widget.Box({
    class_name: "workspaces",
    children: Hyprland.bind('workspaces').transform(ws => {
        return ws.map(({ id }) => Widget.Button({
            on_clicked: () => Hyprland.message(`dispatch workspace ${id}`),
            // child: Widget.Label(`${id}`),
            class_name: Hyprland.active.workspace.bind("id")
                .transform(i => `${i === id ? "active" : ""} workspace`),
        }));
    }),
});

const BatteryLabel = () => Widget.Label({
	// class_name: "battery_label",
	class_name: Battery.bind("percent").transform(p => "battery_label " +
		(p <= 10 ? "critical" : p <= 25 ? "warning" : "")),
	label: Battery.bind("percent").transform(p => `${p}%`),
});
const BatteryIcon = () => Widget.Icon({
	class_name: "battery_icon",
	icon: Battery.bind("icon_name"),
});
const BatteryTime = () => Widget.Label({
	label: Battery.bind("time_remaining").transform(tr => {
		const hours = Math.floor(tr / 3600);
		const minutes = Math.floor((tr % 3600) / 60)
		return `${hours}:${minutes < 10 ? "0" + minutes : minutes}`
	}),
});
const BatteryUntil = () => Widget.Label({
	label: Battery.bind("charging").transform(ch => " Remaining until " + ( ch ? "full" : "empty" )),
});
const BatteryStatus = () => Widget.Box({
	visible: Battery.bind("available"),
	class_name: Battery.bind("charging").transform(ch => ch ? "charging battery" : "battery"),
	children: [
		BatteryLabel(),
		BatteryIcon(),
		BatteryTime(),
		BatteryUntil(),
	],
});

const SysTrayItem = (item) => Widget.Button({
	class_name: "tray-item",
	child: Widget.Icon({ icon: item.bind("icon") }),
	tooltip_markup: item.bind("tooltip_markup"),
	setup: self => {
		const menu = item.menu;
		if (!menu) return;

		const id = item.menu?.connect("popped-up", () => {
			self.toggleClassName("active")
			menu.connect("notify::visible", () => {
				self.toggleClassName("active", menu.visible)
			});
			menu.disconnect(id);
		});

		if (id) self.connect("destroy", () => item.menu?.disconnect(id));
	},

	on_primary_click: btn => item.menu?.popup_at_widget(
		btn, Gdk.Gravity.SOUTH, Gdk.Gravity.NORTH, null),

	on_secondary_click: btn => item.menu?.popup_at_widget(
		btn, Gdk.Gravity.SOUTH, Gdk.Gravity.NORTH, null),
});
const SysTray = () => Widget.Box({
	class_name: "system-tray"
}).bind("children", SystemTray, "items", i => i
	// .filter(({ id }) => !ignore.value.includes(id))
	.map(SysTrayItem))

const Start = () => Widget.Box({
    hexpand: true,
    hpack: "start",
    children: [
			Workspaces()
    ],
  });

const Center = () => Widget.Box({
    children: [
			Date(),
    ],
  });

const End = () => Widget.Box({
		hexpand: true,
		hpack: "end",
		children: [
			SysTray(),
			BatteryStatus(),
		],
	});

// export default (monitor = 0) => Widget.Window({
export default () => Widget.Window({
	// monitor: monitor
	monitor: 0,
	// name: `bar${monitor}`,
	name: "bar",
	anchor: ['top', 'left', 'right'],
	exclusivity: "exclusive",
	child: Widget.CenterBox({
      className: "bar",

      startWidget: Start(),
      centerWidget: Center(),
      endWidget: End(),
    }),
})
