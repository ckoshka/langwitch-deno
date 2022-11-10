// yaml config file, shortened commands, nix environment?, commands should have updater?

import { colors } from "../plugins/deps.ts";
import { Html } from "../plugins/rendering-plugins/mod.ts";

type ExecutableFilename = string;
type ShellCommand = string;
export type CommandMetadata = {
	name: string;
	update: ShellCommand[];
	run: ExecutableFilename;
	desc: string;
    syntax?: string;
    examples?: string;
};

export type Commands = Record<string, CommandMetadata>;

const styler = Html({
	lw: {
		color: "red",
	},
	cmdName: {
		color: "red",
		display: "block",
	},
	cmd: {
		display: "block",
		padding: "3 3 3 3",
	},
});

export const metaCmds = {
	// add
	// update
	// remove
	// rename
	// list
};

export const run = (args: string[]) =>
	async (cmds: Commands): Promise<Commands | undefined> => {
		const name = args.at(0);
		const printCmds = () => {
			console.log(`-----------------`);
			for (const cmd of Object.values(cmds)) {
				styler.log(`<cmd>
            <cmdName>${colors.bold("lw " + cmd.name)} </cmdName>
            <span>${colors.italic(cmd.desc)}</span>
            </cmd>`);
				console.log(`-----------------`);
			}
		};
		if (name === undefined) {
			styler.log(
				`<lw>Hi! You need to specify a command, like learn or fetch. Here's a list of them:</lw>`,
			);
			printCmds();
			return;
		}
        if (name === "meta") {
            const subcmd = args.at(1);
            if (subcmd === undefined || !["add", "update", "remove", "rename", "list"].includes(subcmd)) {
                styler.log(
                    `<lw>Couldn't find that meta command, there's only add, update, remove, rename, and list...</lw>`,
                );
                return;
            }
            return await ({
                add: async () => {
                    const cmd: CommandMetadata = await import(args[2]).then(r => r.default);
                    const proc = Deno.run({ cmd: cmd.update });
		            await proc.status();
                    styler.log(
                        `<lw>Command added!</lw>`,
                    );
                    return {
                        ...cmds,
                        [cmd.name]: cmd
                    }
                },
                remove: () => {
                    const toRemove = args[2];
                    const newCmds = {...cmds};
                    delete newCmds[toRemove];
                    styler.log(
                        `<lw>Command removed!</lw>`,
                    );
                    return newCmds;
                },
                update: async () => {
                    const cmd = cmds[args[2]];
                    const proc = Deno.run({ cmd: cmd.update });
		            await proc.status();
                    styler.log(
                        `<lw>Command successfully updated!</lw>`,
                    );
                },
                rename: () => {
                    const toRemove = args[2];
                    const newName = args[3];
                    const newCmds = {...cmds};
                    delete newCmds[toRemove];
                    newCmds[newName] = cmds[toRemove];
                    newCmds[newName].name = newName;
                    styler.log(
                        `<lw>Command successfully renamed!</lw>`,
                    );
                    return newCmds;
                },
                list: printCmds
            } as any)[subcmd]();
        }
		if (cmds[name] === undefined) {
			styler.log(
				`<lw>I couldn't find the command "${name}"... here's a list of them:</lw>`,
			);
			printCmds();
			return;
		}

		const proc = Deno.run({ cmd: [cmds[name].run, ...args.slice(1)] });
		await proc.status();
	};

await import("./lw.config.ts").then(r => r.default).then(run(Deno.args)).then(async result => {
    result ? await Deno.writeTextFile("lw.config.json", JSON.stringify(result, undefined, 3)) : {};
}).then(() => Deno.exit())

/*console.log(await run({
	echo: {
		name: "echo",
		update: ["echo", "this is filler"],
		run: "./test.sh",
		desc: "echoes stuff",
	},
})(["meta", "add", "echo"]));
*/