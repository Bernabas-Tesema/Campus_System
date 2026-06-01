"""Observer Pattern - Order status notifications."""
from abc import ABC, abstractmethod
from patterns.factory import NotificationFactory
from patterns.singleton import LoggerService


class Observer(ABC):
    @abstractmethod
    def update(self, order, old_status, new_status):
        pass


class StudentNotificationObserver(Observer):
    MESSAGES = {
        'pending': 'Your order was sent to the lounge and is awaiting acceptance.',
        'preparing': 'Your food is being prepared.',
        'ready': 'Your order is ready for pickup!',
        'completed': 'Order completed. Enjoy your meal!',
        'rejected': 'Your order was rejected. Contact the lounge.',
    }

    def _accepted_message(self, order):
        from apps.orders.services import calc_order_prep_minutes
        mins = order.prep_minutes or calc_order_prep_minutes(order)
        lounge_name = order.lounge.name
        return (
            f'{lounge_name} accepted your order. '
            f'Estimated ready in about {mins} minute{"s" if mins != 1 else ""}.'
        )

    def update(self, order, old_status, new_status):
        if old_status is None and new_status != 'pending':
            return

        if new_status == 'accepted':
            msg = self._accepted_message(order)
        else:
            msg = self.MESSAGES.get(new_status, f'Status updated to {new_status}')

        NotificationFactory.create(
            'order_status', order.student.user,
            f'Order #{order.order_key}', msg, order=order,
        )
        LoggerService().info(f'Notified student about order {order.order_key} -> {new_status}')


class LoungeNotificationObserver(Observer):
    def update(self, order, old_status, new_status):
        if new_status == 'pending' and old_status is None:
            for staff in order.lounge.staff.all():
                NotificationFactory.create(
                    'order_placed', staff, 'New Order',
                    f'Order #{order.order_key} from {order.student.user.username}',
                    order=order,
                )


class OrderStatusSubject:
    def __init__(self):
        self._observers = []

    def attach(self, observer):
        self._observers.append(observer)

    def notify(self, order, old_status, new_status):
        for observer in self._observers:
            observer.update(order, old_status, new_status)


order_status_subject = OrderStatusSubject()
order_status_subject.attach(StudentNotificationObserver())
order_status_subject.attach(LoungeNotificationObserver())
