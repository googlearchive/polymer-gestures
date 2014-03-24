/*
 * Copyright (c) 2014 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
 * The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
 * The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
 * Code distributed by Google as part of the polymer project is also
 * subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
 */

/**
 * This event is fired when a pointer quickly goes down and up, and is used to
 * denote activation.
 *
 * Any gesture event can prevent the tap event from being created by calling
 * `event.preventTap`.
 *
 * Any pointer event can prevent the tap by setting the `tapPrevented` property
 * on itself.
 *
 * @module PointerGestures
 * @submodule Events
 * @class tap
 */
/**
 * X axis position of the tap.
 * @property x
 * @type Number
 */
/**
 * Y axis position of the tap.
 * @property y
 * @type Number
 */
/**
 * Type of the pointer that made the tap.
 * @property pointerType
 * @type String
 */
(function(scope) {
  var dispatcher = scope.dispatcher;
  var pointermap = new scope.PointerMap();
  var tap = {
    events: [
      'pointerdown',
      'pointerup',
      'pointercancel',
      'keyup'
    ],
    pointerdown: function(inEvent) {
      if (inEvent.isPrimary && !inEvent.tapPrevented) {
        pointermap.set(inEvent.pointerId, {
          target: inEvent.target,
          buttons: inEvent.buttons,
          x: inEvent.clientX,
          y: inEvent.clientY
        });
      }
    },
    shouldTap: function(e, downState) {
      if (e.pointerType === 'mouse') {
        // only allow left click to tap for mouse
        return downState.buttons === 1;
      }
      return true;
    },
    pointerup: function(inEvent) {
      var start = pointermap.get(inEvent.pointerId);
      if (start && this.shouldTap(inEvent, start)) {
        var t = scope.targetFinding.LCA(start.target, inEvent.target);
        if (t) {
          var e = document.createEvent('Event');
          e.initEvent('tap', true, true);
          e.x = inEvent.clientX;
          e.y = inEvent.clientY;
          e.detail = inEvent.detail;
          e.pointerType = inEvent.pointerType;
          e.pointerId = inEvent.pointerId;
          t.dispatchEvent(e);
        }
      }
      pointermap.delete(inEvent.pointerId);
    },
    pointercancel: function(inEvent) {
      pointermap.delete(inEvent.pointerId);
    },
    keyup: function(inEvent) {
      var code = inEvent.keyCode;
      // 32 == spacebar
      if (code === 32) {
        var t = inEvent.target;
        if (!(t instanceof HTMLInputElement || t instanceof HTMLTextAreaElement)) {
          dispatcher.dispatchEvent(dispatcher.makeEvent('tap', {
            x: 0,
            y: 0,
            detail: 0,
            pointerType: 'unavailable'
          }), t);
        }
      }
    }
  };
  dispatcher.registerGesture('tap', tap);
})(window.PolymerGestures);
