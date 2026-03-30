declare module 'd3-force-3d' {
  export interface Force {
    (alpha: number): void
    strength?: (s?: number) => this
    distance?: (d?: number | ((link: any) => number)) => this
    iterations?: (i?: number) => this
    radius?: (r?: number | ((node: any) => number)) => this
    x?: (x?: number) => this
    y?: (y?: number) => this
    z?: (z?: number) => this
    initialize?: (nodes: any[], ...args: any[]) => void
    links?: (links?: any[]) => this
    id?: (fn?: (node: any) => any) => this
  }

  export function forceManyBody(): Force
  export function forceCenter(x?: number, y?: number, z?: number): Force
  export function forceCollide(radius?: number | ((node: any) => number)): Force
  export function forceLink(links?: any[]): Force
  export function forceRadial(
    radius: number | ((node: any) => number),
    x?: number,
    y?: number,
    z?: number
  ): Force
  export function forceX(x?: number): Force
  export function forceY(y?: number): Force
  export function forceZ(z?: number): Force
  export function forceSimulation(nodes?: any[], numDimensions?: number): any
}
