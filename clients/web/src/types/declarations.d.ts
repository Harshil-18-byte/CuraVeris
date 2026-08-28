declare namespace React {
  export type ReactNode = any;
  export type ReactElement = any;
  export type CSSProperties = any;
  export interface Component<P = any, S = any> {
    props: P;
    state: S;
    setState(state: S | ((prevState: S) => S)): void;
    render(): ReactNode;
  }
}

declare module 'react' {
  export = React;
  export as namespace React;
}

declare module '@tanstack/react-query' {
  export function useQuery<T = any, E = any>(options: any): any;
  export function useMutation<T = any, E = any, V = any>(options: any): any;
  export function useQueryClient(): any;
  export class QueryClient {
    constructor(options?: any);
    setQueryData(key: any, data: any): void;
    invalidateQueries(options: any): void;
    clear(): void;
  }
  export const QueryClientProvider: any;
}
