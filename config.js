import Bar from "./windows/bar.js";
/*
 * TODO when putting in home-manager config:
 * Remove style.css and style.css.map files from source
 * Auto-generate the vars.scss file
 * If possible, auto-input the username to the full file paths
 * For now, still doing without home-manager for faster testing
*/

const scss = "/home/olai/.config/ags/style.scss";
const css = "/home/olai/.config/ags/style.css";
const sass_command = `sass ${scss} ${css}`;
Utils.exec(sass_command);

export default {
		style: css,
    windows: [
			Bar()
    ],
};
