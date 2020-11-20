import React from "react";
import { firebase, useFirebaseApp } from "@cmsonfire/admin-provider";
import "firebase/firestore";

const FirestoreStateContext = React.createContext();
const FirestoreDispatchContext = React.createContext();
const firestoreReducer = (state, action) => {
  switch (action.type) {
    case "UPDATE":
      return {
        ...state,
        db: action.db || null,
      };
    default:
      throw new Error(
        `Unhandled action type: ${action.type} in firestoreReducer`
      );
  }
};
function getInitialState() {
  return { db: null };
}

export const useFirestore = () => {
  const context = React.useContext(FirestoreStateContext);
  if (context === undefined) {
    throw new Error(
      `Context for useFirestore is missing.\nUse withing <FirestoreProvider name={name}>`
    );
  }
  return context.db;
};

export const FirestoreProvider = ({ name, children }) => {
  const [app] = useFirebaseApp(name);
  const [state, updateContext] = React.useReducer(
    firestoreReducer,
    getInitialState()
  );
  React.useEffect(() => {
    if (!app || !firebase) return;
    const db = firebase.firestore(app);
    updateContext({
      type: "UPDATE",
      db,
    });
  }, [app]);

  return (
    <FirestoreStateContext.Provider value={state}>
      <FirestoreDispatchContext.Provider value={updateContext}>
        {children}
      </FirestoreDispatchContext.Provider>
    </FirestoreStateContext.Provider>
  );
};
