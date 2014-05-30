/*
 * Copyright (c) 2014 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
 * The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
 * The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
 * Code distributed by Google as part of the polymer project is also
 * subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
 */

(function(scope) {
  var HAS_FULL_PATH = false;

  // test for full event path support
  var pathTest = document.createElement('meta');
  document.head.appendChild(pathTest);
  if (pathTest.createShadowRoot) {
    var sr = pathTest.createShadowRoot();
    var s = document.createElement('span');
    sr.appendChild(s);
    pathTest.addEventListener('testpath', function(ev) {
      if (ev.path) {
        // if the span is in the event path, then path[0] is the real source for all events
        HAS_FULL_PATH = ev.path[0] === s;
      }
      ev.stopPropagation();
    });
    var ev = new CustomEvent('testpath', {bubbles: true});
    s.dispatchEvent(ev);
  }
  pathTest.parentNode.removeChild(pathTest);
  pathTest = null;

  var target = {
    shadow: function(inEl) {
      if (inEl) {
        return inEl.shadowRoot || inEl.webkitShadowRoot;
      }
    },
    canTarget: function(shadow) {
      return shadow && Boolean(shadow.elementFromPoint);
    },
    targetingShadow: function(inEl) {
      var s = this.shadow(inEl);
      if (this.canTarget(s)) {
        return s;
      }
    },
    olderShadow: function(shadow) {
      var os = shadow.olderShadowRoot;
      if (!os) {
        var se = shadow.querySelector('shadow');
        if (se) {
          os = se.olderShadowRoot;
        }
      }
      return os;
    },
    allShadows: function(element) {
      var shadows = [], s = this.shadow(element);
      while(s) {
        shadows.push(s);
        s = this.olderShadow(s);
      }
      return shadows;
    },
    searchRoot: function(inRoot, x, y) {
      if (inRoot) {
        var t = inRoot.elementFromPoint(x, y);
        var st, sr, os;
        // is element a shadow host?
        sr = this.targetingShadow(t);
        while (sr) {
          // find the the element inside the shadow root
          st = sr.elementFromPoint(x, y);
          if (!st) {
            // check for older shadows
            sr = this.olderShadow(sr);
          } else {
            // shadowed element may contain a shadow root
            var ssr = this.targetingShadow(st);
            return this.searchRoot(ssr, x, y) || st;
          }
        }
        // light dom element is the target
        return t;
      }
    },
    owner: function(element) {
      if (!element) {
        return document;
      }
      var s = element;
      // walk up until you hit the shadow root or document
      while (s.parentNode) {
        s = s.parentNode;
      }
      // the owner element is expected to be a Document or ShadowRoot
      if (s.nodeType != Node.DOCUMENT_NODE && s.nodeType != Node.DOCUMENT_FRAGMENT_NODE) {
        s = document;
      }
      return s;
    },
    findTarget: function(inEvent) {
      if (HAS_FULL_PATH && inEvent.path) {
        return inEvent.path[0];
      }
      var x = inEvent.clientX, y = inEvent.clientY;
      // if the listener is in the shadow root, it is much faster to start there
      var s = this.owner(inEvent.target);
      // if x, y is not in this root, fall back to document search
      if (!s.elementFromPoint(x, y)) {
        s = document;
      }
      return this.searchRoot(s, x, y);
    },
    LCA: function(a, b) {
      if (a === b) {
        return a;
      }
      if (a && !b) {
        return a;
      }
      if (b && !a) {
        return b;
      }
      if (!b && !a) {
        return document;
      }
      // fast case, a is a direct descendant of b or vice versa
      if (a.contains && a.contains(b)) {
        return a;
      }
      if (b.contains && b.contains(a)) {
        return b;
      }
      var adepth = this.depth(a);
      var bdepth = this.depth(b);
      var d = adepth - bdepth;
      if (d > 0) {
        a = this.walk(a, d);
      } else {
        b = this.walk(b, -d);
      }
      while(a && b && a !== b) {
        a = this.walk(a, 1);
        b = this.walk(b, 1);
      }
      return a;
    },
    walk: function(n, u) {
      for (var i = 0; n && (i < u); i++) {
        n = n.parentNode || n.host;
      }
      return n;
    },
    depth: function(n) {
      var d = 0;
      while(n) {
        d++;
        n = n.parentNode || n.host;
      }
      return d;
    },
    deepContains: function(a, b) {
      var common = this.LCA(a, b);
      // if a is the common ancestor, it must "deeply" contain b
      return common === a;
    },
    insideNode: function(node, x, y) {
      var rect = node.getBoundingClientRect();
      return (rect.left <= x) && (x <= rect.right) && (rect.top <= y) && (y <= rect.bottom);
    }
  };
  scope.targetFinding = target;
  /**
   * Given an event, finds the "deepest" node that could have been the original target before ShadowDOM retargetting
   *
   * @param {Event} Event An event object with clientX and clientY properties
   * @return {Element} The probable event origninator
   */
  scope.findTarget = target.findTarget.bind(target);
  /**
   * Determines if the "container" node deeply contains the "containee" node, including situations where the "containee" is contained by one or more ShadowDOM
   * roots.
   *
   * @param {Node} container
   * @param {Node} containee
   * @return {Boolean}
   */
  scope.deepContains = target.deepContains.bind(target);

  /**
   * Determines if the x/y position is inside the given node.
   *
   * Example:
   *
   *     function upHandler(event) {
   *       var innode = PolymerGestures.insideNode(event.target, event.clientX, event.clientY);
   *       if (innode) {
   *         // wait for tap?
   *       } else {
   *         // tap will never happen
   *       }
   *     }
   *
   * @param {Node} node
   * @param {Number} x Screen X position
   * @param {Number} y screen Y position
   * @return {Boolean}
   */
  scope.insideNode = target.insideNode;

})(window.PolymerGestures);
