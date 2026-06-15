# Module M4: Dispatches

## Overview

Core operational module — record every truck load: Car, Quantity, Location, Date, Rate.

## Parameters (Friend's Requirements)

| Field | System |
|-------|--------|
| Car | vehicleId + registration |
| Quantity | quantity |
| Location | deliveryLocation |
| Date | dispatchDate |
| Rate | rate |
| Receive/Remain | via order + payments (M6) |

## Business Rules

- `amount = quantity × rate`
- Dispatch number auto-generated: `DSP-0001`
- On status `delivered` + linked order: increment `order.deliveredQty`, update order status
- On cancel of delivered dispatch: reverse delivered qty on order
- Status flow: scheduled → loaded → in_transit → delivered
