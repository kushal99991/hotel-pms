declare global {
  // Define a global type for state

  type S = any;

  // Define a global type for props

  type T = any;

  // Define a global type for actions (e.g., Redux actions)

  type A = any;

  // You can also declare other global interfaces, types, or modules here
}

// This is necessary to make the file a module and avoid TypeScript errors
export {};
