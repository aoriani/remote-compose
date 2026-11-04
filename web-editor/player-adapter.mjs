// Generic compatibility shim for the pinned experimental player, matching the C++
// bridge: initialize immutable DATA_TEXT nested inside action containers. Otherwise
// a later control sharing an interned name can emit null until the first is clicked.
// Do not apply action/draw/state operations here.
export function initializeNestedText(player,document){
 const context=player.remoteContext;
 if(!context||!Array.isArray(document.mOperations))throw Error('Pinned player data traversal API changed');
 const seen=new Set();
 function visit(operations){for(const op of operations){if(seen.has(op))continue;seen.add(op);if(op.constructor.OP_CODE===102)op.apply(context);const children=op.getList?.();if(Array.isArray(children))visit(children);}}
 visit(document.mOperations);
}
