import { default as outdent } from "https://deno.land/x/outdent@v0.8.0/mod.ts";
export default {
	meta: {
		name: "meta",
		run: ":",
		desc: "Manages meta-commands",
		syntax: outdent`
      lw meta add <url-to-the-command>
      lw meta update <command-name>
      lw meta remove <command-name>
      lw meta rename <old-name> <new-name>
      lw meta list
      `,
	},
};
// could it drop you into a nix-shell where commands like learn whatever or review or config are just there?