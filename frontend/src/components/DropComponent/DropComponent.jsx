import React, { useState, useEffect } from "react";
import { Droppable } from "react-beautiful-dnd";

export const DropComponent = ({ droppableId, children }) => {
    const [enabled, setEnabled] = useState(false);
  
    useEffect(() => {
      // Using setTimeout instead of requestAnimationFrame for better browser support
      const timeout = setTimeout(() => setEnabled(true), 0);
  
      return () => {
         clearTimeout(timeout);
         setEnabled(false);
      };
    }, []);
  
    if (!enabled) {
        return null;
    }
  
    return (
      <Droppable droppableId={droppableId}>
         {(provided, snapshot) => (
           <div
             ref={provided.innerRef}
             {...provided.droppableProps}
           >
             {children(provided, snapshot)}
           </div>
         )}
      </Droppable>
    );
};