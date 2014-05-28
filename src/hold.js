/*
 * Copyright (c) 2014 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
 * The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
 * The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
 * Code distributed by Google as part of the polymer project is also
 * subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
 */

/**
 * This event is fired when a pointer is held down for 200ms.
 *
 * @module PointerGestures
 * @submodule Events
 * @class hold
 */
/**
 * Type of pointer that made the holding event.
 * @type String
 * @property pointerType
 */
/**
 * Screen X axis position of the held pointer
 * @type Number
 * @property clientX
 */
/**
 * Screen Y axis position of the held pointer
 * @type Number
 * @property clientY
 */
/**
 * Type of pointer that made the holding event.
 * @type String
 * @property pointerType
 */
/**
 * This event is fired every 200ms while a pointer is held down.
 *
 * @class holdpulse
 * @extends hold
 */
/**
 * Milliseconds pointer has been held down.
 * @type Number
 * @property holdTime
 */
/**
 * This event is fired when a held pointer is released or moved.
 *
 * @class released
 */

(function(scope) {
  var dispatcher = scope.dispatcher;
  var eventFactory = scope.eventFactory;
  var pointermap = new scope.PointerMap();
  var hold = {
    // wait at least HOLD_DELAY ms between hold and pulse events
    HOLD_DELAY: 200,
    // pointer can move WIGGLE_THRESHOLD pixels before not counting as a hold
    WIGGLE_THRESHOLD: 16,
    events: [
      'down',
      'move',
      'up',
    ],
    pulse: function(pointerId) {
      var p = pointermap.get(pointerId);
      var hold = Date.now() - p.timeStamp;
      var type = p.held ? 'holdpulse' : 'hold';
      this.fireHold(type, pointerId, hold);
      p.held = true;
    },
    cancel: function(inEvent) {
      var p = pointermap.get(inEvent.pointerId);

      clearInterval(p.holdJob);
      if (p.held) {
        this.fireHold('release', inEvent.pointerId);
      }
      pointermap.delete(inEvent.pointerId);
    },
    down: function(inEvent) {
      pointermap.set(inEvent.pointerId, {
        target: inEvent.target,
        buttons: inEvent.buttons,
        x: inEvent.clientX,
        y: inEvent.clientY,
        holdJob: setInterval(this.pulse.bind(this, inEvent.pointerId), this.HOLD_DELAY)
      });
    },
    up: function(inEvent) {
      if (pointermap.has(inEvent.pointerId)) {
        this.cancel(inEvent);
      }
    },
    move: function(inEvent) {
      var p = pointermap.get(inEvent.pointerId);

      if (p) {
        var x = inEvent.clientX - p.x;
        var y = inEvent.clientY - p.y;
        if ((x * x + y * y) > this.WIGGLE_THRESHOLD) {
          this.cancel(inEvent);
        }
      }
    },
    fireHold: function(inType, pointerId, inHoldTime) {
      var heldPointer = pointermap.get(pointerId);

      var p = {
        bubbles: true,
        cancelable: true,
        pointerType: heldPointer.pointerType,
        pointerId: pointerId,
        x: heldPointer.clientX,
        y: heldPointer.clientY
      };
      if (inHoldTime) {
        p.holdTime = inHoldTime;
      }
      var e = eventFactory.makeGestureEvent(inType, p);
      heldPointer.target.dispatchEvent(e);
    }
  };
  dispatcher.registerGesture('hold', hold);
})(window.PolymerGestures);
