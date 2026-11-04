package demo.remotecompose;
import android.view.accessibility.AccessibilityNodeInfo;
/** Compose exposes virtual descendants; provider text-search is not guaranteed. */
final class NativeControls {
    static AccessibilityNodeInfo find(AccessibilityNodeInfo node,String label) {
        if(node==null)return null;
        String text=String.valueOf(node.getText()),description=String.valueOf(node.getContentDescription());
        if(text.equalsIgnoreCase(label)||description.equalsIgnoreCase(label)) {
            AccessibilityNodeInfo action=node;while(action!=null&&!action.isClickable())action=action.getParent();
            if(action!=null)return action;
        }
        for(int i=0;i<node.getChildCount();i++){AccessibilityNodeInfo found=find(node.getChild(i),label);if(found!=null)return found;}
        return null;
    }
}
