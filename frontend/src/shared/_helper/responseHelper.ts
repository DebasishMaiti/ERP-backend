import { Capacitor } from '@capacitor/core';
import { Toast as CapacitorToast } from '@capacitor/toast';
import { toast } from 'sonner';

const platform = Capacitor.getPlatform();

let toastActive = false;

const showToast = async (message, type = 'error') => {
  if (toastActive) return;
  toastActive = true;

  if (platform === 'android' || platform === 'ios') {
    await CapacitorToast.show({
      text: message,
      duration: 'short',
    });
  } else {
    if (type === 'success') {
      toast.success(message);
    } else {
      toast.error(message);
    }
  }

  setTimeout(() => {
    toastActive = false;
  }, 2000);
};

export const errorHandler = (res) => {
  const message = Array.isArray(res?.data?.message)
    ? res.data.message[0]
    : res?.data?.message || 'Something went wrong';

  showToast(message, 'error');
};
export const successHandler = (msg) => {
  showToast(msg, 'success');
};