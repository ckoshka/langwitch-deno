import { Component } from "../../implementors/deps.ts";

export type PrinterEffect = {
	print: (c: Component) => void | Promise<void>;
};
