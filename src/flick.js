/*
 * Copyright 2013 The Polymer Authors. All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */

/**
 * This event denotes a rapid down/move/up sequence from a pointer.
 *
 * The event is sent to the first element the pointer went down on.
 *
 * @module PointerGestures
 * @submodule Events
 * @class flick
 */
/**
 * Signed velocity of the flick in the x direction.
 * @property xVelocity
 * @type Number
 */
/**
 * Signed velocity of the flick in the y direction.
 * @type Number
 * @property yVelocity
 */
/**
 * Unsigned total velocity of the flick.
 * @type Number
 * @property velocity
 */
/**
 * Angle of the flick in degrees, with 0 along the
 * positive x axis.
 * @type Number
 * @property angle
 */
/**
 * Axis with the greatest absolute velocity. Denoted
 * with 'x' or 'y'.
 * @type String
 * @property majorAxis
 */
/**
 * Type of the pointer that made the flick.
 * @type String
 * @property pointerType
 */

(function(scope) {
  var dispatcher = scope.dispatcher;
  var eventFactory = scope.eventFactory;
  var flick = {
    // TODO(dfreedman): value should be low enough for low speed flicks, but
    // high enough to remove accidental flicks
    MIN_VELOCITY: 0.5, /* px/ms */
    MAX_QUEUE: 4,
    moveQueue: [],
    target: null,
    pointerId: null,
    events: [
      'down',
      'move',
      'up',
      'cancel'
    ],
    exposes: [
      'flick'
    ],
    defaultActions: {
      'flick': 'none'
    },
    down: function(inEvent) {
      if (inEvent.isPrimary && !this.pointerId) {
        this.pointerId = inEvent.pointerId;
        this.target = inEvent.target;
        this.addMove(inEvent);
      }
    },
    move: function(inEvent) {
      if (inEvent.pointerId === this.pointerId) {
        this.addMove(inEvent);
      }
    },
    up: function(inEvent) {
      if (inEvent.pointerId === this.pointerId) {
        this.fireFlick(inEvent);
      }
      this.cleanup();
    },
    cancel: function() {
      this.cleanup();
    },
    cleanup: function() {
      this.moveQueue = [];
      this.target = null;
      this.pointerId = null;
    },
    addMove: function(inEvent) {
      if (this.moveQueue.length >= this.MAX_QUEUE) {
        this.moveQueue.shift();
      }
      this.moveQueue.push(inEvent);
    },
    fireFlick: function(inEvent) {
      console.log('fireFlick');
      var e = inEvent;
      var l = this.moveQueue.length;
      var dt, dx, dy, tx, ty, tv, x = 0, y = 0, v = 0;
      // flick based off the fastest segment of movement
      for (var i = 0, m; i < l && (m = this.moveQueue[i]); i++) {
        dt = e.timeStamp - m.timeStamp;
        dx = e.clientX - m.clientX;
        dy = e.clientY - m.clientY;
        tx = dx / dt;
        ty = dy / dt;
        tv = Math.sqrt(tx * tx + ty * ty);
        console.groupCollapsed(i);
        console.log('e.ts:', e.timeStamp, ' m.ts:', m.timeStamp, ' dt:', dt);
        console.log('dx:', dx, ' dy:', dy);
        console.log('tx:', tx, ' ty:', ty);
        console.log('tv:', tv);
        console.groupEnd();
        if (tv > v) {
          x = tx;
          y = ty;
          v = tv;
        }
      }
      var ma = Math.abs(x) > Math.abs(y) ? 'x' : 'y';
      var a = this.calcAngle(x, y);
      console.log(Math.abs(v), this.MIN_VELOCITY, (Math.abs(v) >= this.MIN_VELOCITY));
      if (Math.abs(v) >= this.MIN_VELOCITY) {
        console.log('FLICK');
        var ev = eventFactory.makeGestureEvent('flick', {
          xVelocity: x,
          yVelocity: y,
          velocity: v,
          angle: a,
          majorAxis: ma,
          pointerType: inEvent.pointerType,
          pointerId: inEvent.pointerId
        });
        this.target.dispatchEvent(ev);
      }
    },
    calcAngle: function(inX, inY) {
      return (Math.atan2(inY, inX) * 180 / Math.PI);
    }
  };
  dispatcher.registerGesture('flick', flick);
})(window.PolymerGestures);
