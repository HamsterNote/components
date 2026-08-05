const modalStack: symbol[] = [];
const listeners = new Set<() => void>();

function emitChange() {
  listeners.forEach((listener) => {
    listener();
  });
}

export function registerModal(id: symbol) {
  modalStack.push(id);
  emitChange();

  return () => {
    const index = modalStack.lastIndexOf(id);
    if (index >= 0) {
      modalStack.splice(index, 1);
      emitChange();
    }
  };
}

export function subscribeModalStack(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function isTopmostModal(id: symbol) {
  return modalStack.at(-1) === id;
}
