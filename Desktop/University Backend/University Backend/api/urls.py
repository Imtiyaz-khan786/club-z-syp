from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'users', views.UserViewSet)
router.register(r'events', views.EventViewSet)
router.register(r'holidays', views.HolidayViewSet)
router.register(r'announcements', views.AnnouncementViewSet)
router.register(r'gallery', views.GalleryViewSet)
router.register(r'champions', views.ChampionViewSet)
router.register(r'moments', views.MomentViewSet)
router.register(r'chat-messages', views.ChatMessageViewSet)
router.register(r'attendance', views.AttendanceViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('register/', views.RegisterView.as_view(), name='register'),
    path('login/', views.LoginView.as_view(), name='login'),
    path('dashboard/', views.DashboardView.as_view(), name='dashboard'),
]