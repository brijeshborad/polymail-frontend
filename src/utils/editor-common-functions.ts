import {Mark, Node} from "@tiptap/react";

export function getPlainTextFromHtml(value: string) {
    let textContent = new DOMParser()
        .parseFromString(value, "text/html")
        .documentElement.textContent;
    if (textContent) {
        return textContent.toString();
    }
    return '';
}

export const getSchema = [
    Node.create({
        name: 'text',
        group: 'inline',
    }),
    Node.create({
        addAttributes() {
            return {
                style: {default: null},
                id: {default: null},
                class: {default: null},
                href: {default: null},
            }
        },
        name: 'div',
        content: 'block+',
        code: false,
        marks: '_',
        group: 'block',
        parseHTML() {
            return [{tag: 'div'}]
        },
        renderHTML({node}) {
            return ['div', node.attrs, 0]
        }
    }),
    Node.create({
        addAttributes() {
            return {
                style: {default: null},
                id: {default: null},
                class: {default: null},
                href: {default: null},
                width: {default: null},
                height: {default: null},
                src: {default: null},
                border: {default: null},
                alt: {default: null},
            }
        },
        inline: true,
        content: 'inline*',
        code: false,
        marks: '_',
        group: 'image',
        name: 'image',
        parseHTML() {
            return [{tag: 'img'}]
        },
        renderHTML({node}) {
            return ['img', node.attrs, 0]
        }
    }),
    Node.create({
        addAttributes() {
            return {
                style: {default: null},
                id: {default: null},
                class: {default: null}
            }
        },
        name: 'paragraph',
        content: '(inline|image?)*',
        code: false,
        marks: '_',
        group: 'block',
        parseHTML() {
            return [{tag: 'p'}]
        },
        renderHTML({node}) {
            // let style = node.attrs.style;
            // if (style) {
            //   style += ' margin-block-start: 1em; margin-block-end: 1em;';
            // } else {
            //   style = ' margin-block-start: 1em; margin-block-end: 1em;';
            // }
            return ['p', node.attrs, 0]
        }
    }),
    Node.create({
        name: 'table',
        group: 'block',
        content: 'tableRow+',
        tableRole: 'table',
        isolating: true,
        addAttributes() {
            return {
                style: {default: null},
                id: {default: null},
                class: {default: null},
                width: {default: null},
                height: {default: null},
                border: {default: null}
            }
        },
        code: false,
        marks: '_',
        parseHTML() {
            return [{tag: 'table'}]
        },
        renderHTML({node}) {
            return ['table', node.attrs, ['tbody', 0]]
        }
    }),
    Node.create({
        name: 'tableRow',
        content: '(tableCell | tableHeader)*',
        tableRole: 'row',
        parseHTML() {
            return [{tag: 'tr'}]
        },
        renderHTML({node}) {
            return ['tr', node.attrs, 0]
        },
    }),
    Node.create({
        name: 'tableHeader',
        content: 'block+',
        addAttributes() {
            return {
                style: {default: null},
                id: {default: null},
                class: {default: null},
                colspan: {default: 1},
                rowspan: {default: 1},
                colwidth: {
                    default: null,
                    parseHTML: element => {
                        const colwidth = element.getAttribute('colwidth')
                        return colwidth
                            ? [parseInt(colwidth, 10)]
                            : null
                    },
                },
            }
        },
        tableRole: 'header_cell',
        isolating: true,
        parseHTML() {
            return [{tag: 'th'}]
        },
        renderHTML({node}) {
            return ['th', node.attrs, 0]
        },
    }),
    Node.create({
        name: 'tableCell',
        content: 'block+',
        addAttributes() {
            return {
                style: {default: null},
                id: {default: null},
                class: {default: null},
                colspan: {default: 1},
                rowspan: {default: 1},
                colwidth: {
                    default: null,
                    parseHTML: element => {
                        const colwidth = element.getAttribute('colwidth')
                        return colwidth
                            ? [parseInt(colwidth, 10)]
                            : null
                    },
                },
            }
        },
        tableRole: 'cell',
        isolating: true,
        parseHTML() {
            return [{tag: 'td'}]
        },
        renderHTML() {
            return ['td', 0]
        },
    }),
    Node.create({
        name: 'center',
        content: 'block+',
        group: 'block',
        addAttributes() {
            return {
                style: {default: null},
                id: {default: null},
                class: {default: null},
                "data-link-color": {default: null},
                "data-body-style": {default: null},
            }
        },
        parseHTML() {
            return [{tag: 'center'}]
        },
        renderHTML() {
            return ['center', 0]
        },
    }),
    Node.create({
        name: 'doc',
        group: 'block+',
    }),
    Mark.create({
        name: 'link',
        addAttributes() {
            return {
                href: {},
                title: {default: null},
                style: {},
                id: {}
            }
        },
        inclusive: false,
        parseHTML() {
            return [{tag: "a[href]"}]
        },
        renderHTML(node) {
            return ["a", node.mark.attrs, 0]
        }
    }),
]
