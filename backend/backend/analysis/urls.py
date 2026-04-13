from django.urls import path
from .views import RealTimeAnalysisView, PersonaListView, LoginView, RegisterView

urlpatterns = [
    path('analyze/', RealTimeAnalysisView.as_view(), name='analyze'),
    path('personas/', PersonaListView.as_view(), name='personas'),
    path('login/', LoginView.as_view(), name='login'),
    path('register/', RegisterView.as_view(), name='register'),
]
