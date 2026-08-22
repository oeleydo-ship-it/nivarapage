import { create } from 'zustand'

export type Device = 'desktop' | 'tablet' | 'mobile'

export const DEVICE_WIDTHS: Record<Device, number> = {
  desktop: 1280,
  tablet: 768,
  mobile: 390,
}

interface DeviceState {
  device: Device
  setDevice: (device: Device) => void
}

export const useDevicePreviewStore = create<DeviceState>((set) => ({
  device: 'desktop',
  setDevice: (device) => set({ device }),
}))
