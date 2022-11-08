import { colors, RenderKid } from "../deps.ts";


export type HtmlProps = {
    color?: string;
    background?: string;
    width?: string;
    height?: string;
    bullet?: string;
    display?: string;
    margin?: string;
    marginTop?: string;
    marginLeft?: string;
    marginRight?: string;
    marginBottom?: string;
    padding?: string;
    paddingTop?: string;
    paddingLeft?: string;
    paddingRight?: string;
    paddingBottom?: string;
}

export const Html = (style: Record<string, HtmlProps> = {}) => {
    const r = new RenderKid();

    const self = {
        where: (s2: Record<string, HtmlProps>) => Html({...style, ...s2}),
        render: (html: string) => {
            r.style(style);
            return r.render(html);
        },
        log: (html: string) => console.log(self.render(html))
    }
    return self;
}

/*console.log(Html({
    "box": {
        background: "black",
        paddingTop: "40",
        color: "white"
    }
}).render(`<box>${colors.bold("hello")} </box>`))*/