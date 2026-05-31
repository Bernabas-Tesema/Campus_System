"""Strategy Pattern - Payment methods and search/filter."""
from abc import ABC, abstractmethod
from django.db.models import Q


class PaymentStrategy(ABC):
    @abstractmethod
    def process(self, amount, order):
        pass


class CashPayment(PaymentStrategy):
    def process(self, amount, order):
        return {
            'success': False,
            'method': 'cash',
            'amount': float(amount),
            'transaction_id': f'CASH-{order.order_key}',
            'message': 'Pay at pickup',
        }


class CardPayment(PaymentStrategy):
    def process(self, amount, order):
        return {'success': True, 'method': 'card', 'amount': float(amount),
                'transaction_id': f'CARD-{order.order_key}', 'message': 'Card payment processed'}


class MobilePayment(PaymentStrategy):
    def process(self, amount, order):
        return {'success': True, 'method': 'mobile', 'amount': float(amount),
                'transaction_id': f'MOB-{order.order_key}', 'message': 'Mobile payment processed'}


PAYMENT_STRATEGIES = {'cash': CashPayment, 'card': CardPayment, 'mobile': MobilePayment}


class PaymentContext:
    def __init__(self, method='cash'):
        self._strategy = PAYMENT_STRATEGIES.get(method, CashPayment)()

    def execute(self, amount, order):
        return self._strategy.process(amount, order)


class SearchStrategy(ABC):
    @abstractmethod
    def apply(self, queryset, query):
        pass


class NameSearch(SearchStrategy):
    def apply(self, queryset, query):
        return queryset.filter(Q(name__icontains=query) | Q(description__icontains=query))


class CategorySearch(SearchStrategy):
    def apply(self, queryset, query):
        return queryset.filter(category__name__icontains=query)


class PriceSearch(SearchStrategy):
    def apply(self, queryset, query):
        try:
            parts = query.split('-')
            lo, hi = float(parts[0]), float(parts[1]) if len(parts) > 1 else 999
            return queryset.filter(price__gte=lo, price__lte=hi)
        except (ValueError, IndexError):
            return queryset


SEARCH_STRATEGIES = {'name': NameSearch, 'category': CategorySearch, 'price': PriceSearch}


class SearchContext:
    def __init__(self, strategy='name'):
        self._strategy = SEARCH_STRATEGIES.get(strategy, NameSearch)()

    def execute(self, queryset, query):
        return self._strategy.apply(queryset, query)
