import { useEffect, useState } from 'react'
import { Snackbar, Alert } from '@mui/material'
import { TOAST_EVENT } from '../../services/toast'

export default function ToastListener() {
  const [open, setOpen] = useState(false)
  const [toast, setToast] = useState({ message: '', severity: 'info', duration: 5000 })

  useEffect(() => {
    function handler(evt) {
      const detail = evt?.detail || {}
      setToast({
        message:  String(detail.message || ''),
        severity: detail.severity || 'info',
        duration: typeof detail.duration === 'number' ? detail.duration : 5000,
      })
      setOpen(true)
    }
    window.addEventListener(TOAST_EVENT, handler)
    return () => window.removeEventListener(TOAST_EVENT, handler)
  }, [])

  return (
    <Snackbar
      open={open}
      autoHideDuration={toast.duration}
      onClose={(_, reason) => { if (reason !== 'clickaway') setOpen(false) }}
      anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
    >
      <Alert
        severity={toast.severity}
        variant="filled"
        onClose={() => setOpen(false)}
        sx={{ width: '100%' }}
      >
        {toast.message}
      </Alert>
    </Snackbar>
  )
}
