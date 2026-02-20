/**
 * A2UI Message Types — v0.9 Specification
 *
 * Message envelope names follow the v0.9 spec:
 *   createSurface, updateComponents, updateDataModel, deleteSurface
 *
 * Component format uses the v0.9 flat discriminator:
 *   { id, component: "Text", text: "Hello", variant: "h1", children?: [...] }
 *
 * Data binding uses v0.9 stringOrPath:
 *   "Hello"  (plain string)  or  { path: "/key" }
 */

// ---------------------------------------------------------------------------
// Messages
// ---------------------------------------------------------------------------

export type A2UIMessage =
  | CreateSurfaceMessage
  | UpdateComponentsMessage
  | UpdateDataModelMessage
  | DeleteSurfaceMessage;

/** Initialise a new surface. Sent FIRST, before components/data. */
export interface CreateSurfaceMessage {
  createSurface: {
    surfaceId: string;
    catalogId: string;
  };
}

/** Add or replace components in an existing surface. */
export interface UpdateComponentsMessage {
  updateComponents: {
    surfaceId: string;
    components: ComponentNode[];
  };
}

/** Update the data model for an existing surface. */
export interface UpdateDataModelMessage {
  updateDataModel: {
    surfaceId: string;
    /** JSON Pointer path within the data model. Defaults to "/" (root). */
    path?: string;
    /** Operation: "add", "replace", or "remove". Defaults to "replace". */
    op?: 'add' | 'replace' | 'remove';
    /** The data payload (any valid JSON). Required for add/replace. */
    value?: Record<string, unknown>;
  };
}

/** Delete / tear-down a surface. */
export interface DeleteSurfaceMessage {
  deleteSurface: {
    surfaceId: string;
  };
}

// ---------------------------------------------------------------------------
// Component Node — v0.9 flat format
// ---------------------------------------------------------------------------

/**
 * A component node in the flat adjacency list.
 *
 * v0.9 format: the `component` field is a string discriminator (e.g. "Text")
 * and all component-specific props sit at the SAME level as `id` / `children`.
 */
export interface ComponentNode {
  id: string;
  /** Component type name from the catalog (e.g. "Text", "Stack", "Button"). */
  component: string;
  /** IDs of child components (for layout containers). */
  children?: string[];
  /**
   * Component-specific props — varies per component type.
   * Typed as `any` because the security boundary is in catalog.ts's renderNode,
   * not in the type system. Using `unknown` here would require hundreds of
   * redundant type assertions in the render code.
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [prop: string]: any;
}

// ---------------------------------------------------------------------------
// Data Binding — v0.9 stringOrPath
// ---------------------------------------------------------------------------

/** A value that is either a literal string or a data-model path reference. */
export type StringOrPath = string | DataBinding;

/** A value that is either a literal number or a data-model path reference. */
export type NumberOrPath = number | DataBinding;

export interface DataBinding {
  path: string; // JSON Pointer, e.g. "/transaction/merchant"
}

/**
 * Legacy action binding — kept for backward compat with existing mock agents.
 * Will be phased out in favour of ActionDefinition.
 */
export interface ActionBinding {
  eventType: 'click' | 'change' | 'dismiss' | 'submit';
  dataPath?: string;
  value?: string | number | boolean;
}

// ---------------------------------------------------------------------------
// v0.9 Spec Action Types
// ---------------------------------------------------------------------------

/**
 * An action definition on a Button or interactive component (v0.9 spec).
 * 
 * When the user triggers this action, the client resolves all context paths
 * from the local data model and sends a UserAction message to the agent.
 *
 * Example:
 * {
 *   name: "confirm_transfer",
 *   context: [
 *     { key: "fromAccount", value: { path: "/transfer/from" } },
 *     { key: "amount", value: { path: "/transfer/amount" } },
 *     { key: "source", value: "transfer_form" }
 *   ]
 * }
 */
export interface ActionDefinition {
  /** Action name — identifies the action for the agent (e.g. "confirm_transfer") */
  name: string;
  /** Context items: key-value pairs where values can be literal or data-model paths */
  context?: ActionContextItem[];
}

export interface ActionContextItem {
  key: string;
  value: string | number | boolean | DataBinding;
}

/**
 * Client-to-server message sent when a user triggers an action (v0.9 spec).
 * The client resolves all context paths before sending.
 */
export interface UserActionMessage {
  userAction: {
    /** The action name from the ActionDefinition */
    name: string;
    /** Surface where the action originated */
    surfaceId: string;
    /** Component ID that triggered the action */
    sourceComponentId: string;
    /** ISO 8601 timestamp */
    timestamp: string;
    /** Resolved context — all paths have been replaced with actual values */
    context: Record<string, unknown>;
  };
}

// ---------------------------------------------------------------------------
// Surface State
// ---------------------------------------------------------------------------

export interface SurfaceState {
  surfaceId: string;
  catalogId?: string;
  /** v0.9: no explicit root ID — always "root" by convention. */
  root?: string;
  components: Map<string, ComponentNode>;
  dataModel: Map<string, unknown>;
  rendering: boolean;
}

// ---------------------------------------------------------------------------
// Legacy aliases (temporary — remove once all consumers are migrated)
// ---------------------------------------------------------------------------

/** @deprecated Use CreateSurfaceMessage */
export type BeginRenderingMessage = CreateSurfaceMessage;
/** @deprecated Use UpdateComponentsMessage */
export type SurfaceUpdateMessage = UpdateComponentsMessage;
/** @deprecated Use UpdateDataModelMessage */
export type DataModelUpdateMessage = UpdateDataModelMessage;
