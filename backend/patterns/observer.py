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
        'pending': 'Your order is pending confirmation.',
        'accepted': 'Your order has been accepted and is being prepared.',
        'preparing': 'Your food is being prepared.',
        'ready': 'Your order is ready for pickup!',
        'completed': 'Order completed. Enjoy your meal!',
        'rejected': 'Your order was rejected. Contact the lounge.',
    }

    def update(self, order, old_status, new_status):
        if old_status is None:
            return
        msg = self.MESSAGES.get(new_status, f'Status updated to {new_status}')
        NotificationFactory.create(
            'order_status', order.student.user,
            f'Order #{order.order_key}', msg, order=order,
        )
        LoggerService().info(f'Notified student about order {order.order_key}')


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
