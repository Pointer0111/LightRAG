/**
 * FocusOnNode – stub retained for import compatibility.
 *
 * In the 3D rewrite the focus/fly-to logic lives directly inside
 * GraphViewer.tsx (GSAP camera animation + moveToSelectedNode effect).
 * This component is no longer needed but kept as an empty component
 * so any future import of it does not break the build.
 */
const FocusOnNode = (_props: { node?: string | null; move?: boolean }) => null

export default FocusOnNode
