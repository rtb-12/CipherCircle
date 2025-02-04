import { update } from "@react-spring/web";

export const idlFactory = ({ IDL }) => {
  return IDL.Service({ 'ask_ollama' : IDL.Func([IDL.Text], [IDL.Text], [update]) });
};
export const init = ({ IDL }) => { return []; };
