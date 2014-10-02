/*
 * Copyright (c) 2014 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
 * The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
 * The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
 * Code distributed by Google as part of the polymer project is also
 * subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
 */

/**
 * This event denotes the beginning of a series of tracking events.
 *
 * @module PointerGestures
 * @submodule Events
 * @class trackstart
 */
/**
 * Pixels moved in the x direction since trackstart.
 * @type Number
 * @property dx
 */
/**
 * Pixes moved in the y direction since trackstart.
 * @type Number
 * @property dy
 */
/**
 * Pixels moved in the x direction since the last track.
 * @type Number
 * @property ddx
 */
/**
 * Pixles moved in the y direction since the last track.
 * @type Number
 * @property ddy
 */
/**
 * The clientX position of the track gesture.
 * @type Number
 * @property clientX
 */
/**
 * The clientY position of the track gesture.
 * @type Number
 * @property clientY
 */
/**
 * The pageX position of the track gesture.
 * @type Number
 * @property pageX
 */
/**
 * The pageY position of the track gesture.
 * @type Number
 * @property pageY
 */
/**
 * The screenX position of the track gesture.
 * @type Number
 * @property screenX
 */
/**
 * The screenY position of the track gesture.
 * @type Number
 * @property screenY
 */
/**
 * The last x axis direction of the pointer.
 * @type Number
 * @property xDirection
 */
/**
 * The last y axis direction of the pointer.
 * @type Number
 * @property yDirection
 */
/**
 * A shared object between all tracking events.
 * @type Object
 * @property trackInfo
 */
/**
 * The element currently under the pointer.
 * @type Element
 * @property relatedTarget
 */
/**
 * The type of pointer that make the track gesture.
 * @type String
 * @property pointerType
 */
/**
 *
 * This event fires for all pointer movement being tracked.
 *
 * @class track
 * @extends trackstart
 */
/**
 * This event fires when the pointer is no longer being tracked.
 *
 * @class trackend
 * @extends trackstart
 */

(function(scope) {

  var dispatcher = scope.dispatcher;
  var eventFactory = scope.eventFactory;
  var pointermap = new scope.PointerMap();

  var EVENT_CAPTURE = Boolean(navigator.userAgent.match('Chrome'));
  var POINTER_CAPTURE = Boolean(dispatcher.eventSources.pointer);
  var MS_POINTER_CAPTURE = Boolean(dispatcher.eventSources.ms);
  var SCRIM = !(EVENT_CAPTURE || POINTER_CAPTURE || MS_POINTER_CAPTURE) && initScrim();

  function capturedMouseMove(ev) {
    if (EVENT_CAPTURE) {
      ev.preventDefault();
    }
    dispatcher.boundHandler(ev);
  }

  function initScrim() {
    var el = document.createElement('div');
    var s = el.style;
    s.position = 'fixed';
    s.height = '100%';
    s.width = '100%';
    s.top = s.left = s.bottom = s.right = 0;
    s.zIndex = 9999;
    s.background = 'rgba(0,0,0,0.12)';
    return el;
  }

  function showScrim() {
    document.body.insertBefore(SCRIM, document.body.firstChild);
  }

  function hideScrim() {
    if (SCRIM.parentNode) {
      SCRIM.parentNode.removeChild(SCRIM);
    }
  }

  function preventSelection(toggle) {
    document.body.classList.toggle('polymerGesturesPreventSelection', toggle);
  }

  var track = {
    events: [
      'down',
      'move',
      'up',
    ],
    exposes: [
      'trackstart',
      'track',
      'trackx',
      'tracky',
      'trackend'
    ],
    defaultActions: {
      'track': 'none',
      'trackx': 'pan-y',
      'tracky': 'pan-x'
    },
    WIGGLE_THRESHOLD: 4,
    clampDir: function(inDelta) {
      return inDelta > 0 ? 1 : -1;
    },
    calcPositionDelta: function(inA, inB) {
      var x = 0, y = 0;
      if (inA && inB) {
        x = inB.pageX - inA.pageX;
        y = inB.pageY - inA.pageY;
      }
      return {x: x, y: y};
    },
    capture: function(pointerId) {
      var p = pointermap.get(pointerId);
      if (!p) {
        return;
      }
      var node = p.downTarget;
      if (POINTER_CAPTURE) {
        node.setPointerCapture(pointerId);
      } else if (MS_POINTER_CAPTURE) {
        node.msSetPointerCapture(pointerId);
      } else if (SCRIM) {
        showScrim();
      }
      document.addEventListener('mousemove', capturedMouseMove, true);
      preventSelection(true);
    },
    release: function(pointerId) {
      var p = pointermap.get(pointerId);
      if (!p) {
        return;
      }
      var node = p.downTarget;
      if (POINTER_CAPTURE) {
        node.releasePointerCapture(pointerId);
      } else if (MS_POINTER_CAPTURE) {
        node.msReleasePointerCapture(pointerId);
      } else if (SCRIM) {
        hideScrim();
      }
      document.removeEventListener('mousemove', capturedMouseMove, true);
      preventSelection(false);
    },
    fireTrack: function(inType, inEvent, inTrackingData) {
      var t = inTrackingData;
      var d = this.calcPositionDelta(t.downEvent, inEvent);
      var dd = this.calcPositionDelta(t.lastMoveEvent, inEvent);
      if (dd.x) {
        t.xDirection = this.clampDir(dd.x);
      } else if (inType === 'trackx') {
        return;
      }
      if (dd.y) {
        t.yDirection = this.clampDir(dd.y);
      } else if (inType === 'tracky') {
        return;
      }
      var gestureProto = {
        bubbles: true,
        cancelable: true,
        trackInfo: t.trackInfo,
        relatedTarget: inEvent.relatedTarget,
        pointerType: inEvent.pointerType,
        pointerId: inEvent.pointerId,
        preventDefault: function() {
          track.release(this.pointerId);
        },
        _source: 'track'
      };
      if (inType !== 'tracky') {
        gestureProto.x = inEvent.x;
        gestureProto.dx = d.x;
        gestureProto.ddx = dd.x;
        gestureProto.clientX = inEvent.clientX;
        gestureProto.pageX = inEvent.pageX;
        gestureProto.screenX = inEvent.screenX;
        gestureProto.xDirection = t.xDirection;
      }
      if (inType !== 'trackx') {
        gestureProto.dy = d.y;
        gestureProto.ddy = dd.y;
        gestureProto.y = inEvent.y;
        gestureProto.clientY = inEvent.clientY;
        gestureProto.pageY = inEvent.pageY;
        gestureProto.screenY = inEvent.screenY;
        gestureProto.yDirection = t.yDirection;
      }
      var e = eventFactory.makeGestureEvent(inType, gestureProto);
      t.downTarget.dispatchEvent(e);
    },
    down: function(inEvent) {
      if (inEvent.isPrimary && (inEvent.pointerType === 'mouse' ? inEvent.buttons === 1 : true)) {
        var p = {
          downEvent: inEvent,
          downTarget: inEvent.target,
          trackInfo: {},
          lastMoveEvent: null,
          xDirection: 0,
          yDirection: 0,
          tracking: false
        };
        pointermap.set(inEvent.pointerId, p);
        this.capture(inEvent.pointerId);
      }
    },
    move: function(inEvent) {
      var p = pointermap.get(inEvent.pointerId);
      if (p) {
        if (!p.tracking) {
          var d = this.calcPositionDelta(p.downEvent, inEvent);
          var move = d.x * d.x + d.y * d.y;
          // start tracking only if finger moves more than WIGGLE_THRESHOLD
          if (move > this.WIGGLE_THRESHOLD) {
            p.tracking = true;
            p.lastMoveEvent = p.downEvent;
            this.fireTrack('trackstart', inEvent, p);
          }
        }
        if (p.tracking) {
          this.fireTrack('track', inEvent, p);
          this.fireTrack('trackx', inEvent, p);
          this.fireTrack('tracky', inEvent, p);
        }
        p.lastMoveEvent = inEvent;
      }
    },
    up: function(inEvent) {
      var p = pointermap.get(inEvent.pointerId);
      if (p) {
        if (p.tracking) {
          this.fireTrack('trackend', inEvent, p);
          this.release(inEvent.pointerId);
        }
        pointermap.delete(inEvent.pointerId);
      }
    }
  };
  dispatcher.registerGesture('track', track);
})(window.PolymerGestures);
