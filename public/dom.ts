/// <reference lib="dom"/>

export function $<T extends HTMLElement>(first: string | HTMLElement, second?: string): T {
  if (typeof first === "string") return document.querySelector(first) as T;
  else if (second != null) return first.querySelector(second) as T;
  return first as T;
}

export function $$<T extends HTMLElement>(first: string | HTMLElement, second?: string): Array<T> {
  if (typeof first === "string") return Array.from(document.querySelectorAll(first));
  else return Array.from(first.querySelectorAll(second as string));
}

export function $make<K extends keyof HTMLElementTagNameMap>(tagName: K, parent?: HTMLElement | null, props?: Partial<HTMLElementTagNameMap[K]>) {
  const elt = document.createElement(tagName);
  if (parent != null) parent.appendChild(elt);
  if (props != null) for (const key in props) {
    if (key === "dataset") for (const dataKey in props.dataset) elt.dataset[dataKey] = props.dataset[dataKey];
    else elt[key] = props[key]!;
  }
  return elt;
}