import { discountPercentOf, formatMoney, parseRoomPrice, sellingAmount, stayCurrency } from '../../data/hospitality'
import { ROOM_PRICE_COLORS } from '../../data/roomPrice'
import type { RoomTypeItem } from '../../types'

interface Props {
  room: RoomTypeItem
  suffix?: string
  rateHint?: boolean
}

export function RoomPrice({ room, suffix, rateHint }: Props) {
  const base = parseRoomPrice(room.basePrice)
  const percent = discountPercentOf(room)
  const selling = sellingAmount(base, percent)
  const currency = stayCurrency(room.currency)

  return (
    <span data-room-price="" className="inline-block max-w-full rounded-xl px-3 py-2 text-left leading-normal" style={{ backgroundColor: ROOM_PRICE_COLORS.background, color: ROOM_PRICE_COLORS.amount, textDecoration: 'none' }}>
      {percent > 0 && (
        <span className="mb-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm">
          <span style={{ color: ROOM_PRICE_COLORS.muted }}><del data-price-original="" style={{ textDecoration: 'line-through' }}>{formatMoney(base, currency)}</del></span>
          <span className="rounded-full px-2 py-0.5 text-xs font-semibold" style={{ color: ROOM_PRICE_COLORS.discount, backgroundColor: ROOM_PRICE_COLORS.discountBackground }}>{percent}% off</span>
        </span>
      )}
      <span className="block">
        <span data-price-current="" className="text-xl font-bold tabular-nums" style={{ color: ROOM_PRICE_COLORS.amount, textDecoration: 'none' }}>{formatMoney(selling, currency)}</span>
        {suffix && <span className="ml-1 text-sm font-normal" style={{ color: ROOM_PRICE_COLORS.muted }}>{suffix}</span>}
      </span>
      {rateHint && (
        <span className="mt-1 block text-xs font-normal" style={{ color: ROOM_PRICE_COLORS.muted }}>ETB and USD both show on the exported site after the hotel sets the USD to ETB rate.</span>
      )}
    </span>
  )
}
