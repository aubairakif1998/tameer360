import { BadRequestException } from '@nestjs/common';

export function resolveDispatchSchedule(input: {
  scheduledStartAt?: string;
  expectedDeliveryAt?: string;
  dispatchDate?: string;
  orderExpectedDeliveryDate?: string | null;
}): {
  scheduledStartAt: Date;
  expectedDeliveryAt: Date;
  dispatchDate: string;
} {
  const fallbackDate =
    input.orderExpectedDeliveryDate?.trim() ||
    input.dispatchDate?.trim() ||
    new Date().toISOString().slice(0, 10);

  const scheduledStartAt = input.scheduledStartAt
    ? new Date(input.scheduledStartAt)
    : new Date(`${fallbackDate}T08:00:00`);

  const expectedDeliveryAt = input.expectedDeliveryAt
    ? new Date(input.expectedDeliveryAt)
    : new Date(`${fallbackDate}T17:00:00`);

  if (
    Number.isNaN(scheduledStartAt.getTime()) ||
    Number.isNaN(expectedDeliveryAt.getTime())
  ) {
    throw new BadRequestException({
      code: 'INVALID_DISPATCH_SCHEDULE',
      message: 'Invalid dispatch start or expected delivery time',
    });
  }

  if (expectedDeliveryAt <= scheduledStartAt) {
    throw new BadRequestException({
      code: 'DISPATCH_SCHEDULE_INVALID',
      message: 'Dispatch start must be before expected delivery time',
    });
  }

  const dispatchDate = scheduledStartAt.toISOString().slice(0, 10);

  return {
    scheduledStartAt,
    expectedDeliveryAt,
    dispatchDate,
  };
}
