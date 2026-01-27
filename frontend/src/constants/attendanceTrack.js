import manual from '@assets/images/manual.svg'
import both_tracking from '@assets/images/both-tracking.svg'
import scan from '@assets/images/qr-scan.svg'
import no_tracking from '@assets/images/no-tracking.svg'

export const attendanceTrackingType = [
  { id: 'manual', label: 'Manual attendance', sublabel: 'Simple and quick — ideal for small teams.', image: manual },
  { id: 'scan', label: 'QR / Card scan', sublabel: 'Contactless entry that prevents misuse and saves star time',image: scan },
  { id: 'both', label: 'Both Manual & QR', sublabel: 'Maximum flexibility for busy hours and backup situations.',image: both_tracking },
  { id: 'no-tracking', label: 'I don’t need attendance tracking', sublabel: '',image: no_tracking },
]
