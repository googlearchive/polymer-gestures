/*
 * Copyright (c) 2014 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
 * The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
 * The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
 * Code distributed by Google as part of the polymer project is also
 * subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
 */

(function(scope) {
  var dispatcher = scope.dispatcher;
  var pointermap = dispatcher.pointermap;
  var pointerEvents = {
    events: [
      'pointerdown',
      'pointermove',
      'pointerup',
      'pointercancel'
    ],
    prepareEvent: function(inEvent) {
      return dispatcher.cloneEvent(inEvent);
    },
    register: function(target) {
      dispatcher.listen(target, this.events);
    },
    unregister: function(target) {
      dispatcher.unlisten(target, this.events);
    },
    cleanup: function(id) {
      pointermap['delete'](id);
    },
    pointerdown: function(inEvent) {
      pointermap.set(inEvent.pointerId, inEvent.target);
      var e = this.prepareEvent(inEvent);
      dispatcher.down(e);
    },
    pointermove: function(inEvent) {
      var e = this.prepareEvent(inEvent);
      e.target = pointermap.get(inEvent.pointerId);
      dispatcher.move(e);
    },
    pointerup: function(inEvent) {
      var e = this.prepareEvent(inEvent);
      e.target = pointermap.get(inEvent.pointerId);
      e.relatedTarget = inEvent.getTarget;
      dispatcher.up(e);
      this.cleanup(inEvent.pointerId);
    },
    pointercancel: function(inEvent) {
      this.pointerup(inEvent);
    }
  };

  scope.pointerEvents = pointerEvents;
})(window.PolymerGestures);
