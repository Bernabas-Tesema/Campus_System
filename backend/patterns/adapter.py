"""Adapter Pattern - External payment gateway integration."""
from abc import ABC, abstractmethod
from patterns.singleton import LoggerService


class ExternalGateway(ABC):
    @abstractmethod
    def charge(self, amount, currency, customer_id):
        pass


class StripeGateway(ExternalGateway):
    def charge(self, amount, currency, customer_id):
        return {'id': f'ch_{customer_id}_{int(amount*100)}', 'status': 'succeeded',
                'amount_cents': int(amount * 100), 'currency': currency}


class PayPalGateway(ExternalGateway):
    def charge(self, amount, currency, customer_id):
        return {'payment_id': f'PAY-{customer_id}', 'state': 'approved',
                'total': str(amount), 'currency_code': currency}


class PaymentAdapter(ABC):
    @abstractmethod
    def process(self, amount, order):
        pass


class StripeAdapter(PaymentAdapter):
    def __init__(self, gateway=None):
        self.gateway = gateway or StripeGateway()
        self.logger = LoggerService()

    def process(self, amount, order):
        result = self.gateway.charge(float(amount), 'USD', str(order.student.id))
        self.logger.info(f'Stripe payment: {result["id"]}')
        return {'success': result['status'] == 'succeeded', 'method': 'stripe',
                'amount': float(amount), 'transaction_id': result['id'],
                'message': 'Paid via Stripe'}


class PayPalAdapter(PaymentAdapter):
    def __init__(self, gateway=None):
        self.gateway = gateway or PayPalGateway()
        self.logger = LoggerService()

    def process(self, amount, order):
        result = self.gateway.charge(float(amount), 'USD', str(order.student.id))
        self.logger.info(f'PayPal payment: {result["payment_id"]}')
        return {'success': result['state'] == 'approved', 'method': 'paypal',
                'amount': float(amount), 'transaction_id': result['payment_id'],
                'message': 'Paid via PayPal'}


EXTERNAL_ADAPTERS = {'stripe': StripeAdapter, 'paypal': PayPalAdapter}
