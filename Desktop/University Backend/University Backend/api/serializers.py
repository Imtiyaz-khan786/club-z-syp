from rest_framework import serializers
from django.contrib.auth.models import User
from .models import *

class UserSerializer(serializers.ModelSerializer):
    role = serializers.SerializerMethodField()
    phone = serializers.SerializerMethodField()
    
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'role', 'phone', 'date_joined']
    
    def get_role(self, obj):
        if hasattr(obj, 'profile'):
            return obj.profile.role
        return 'student'
    
    def get_phone(self, obj):
        if hasattr(obj, 'profile'):
            return obj.profile.phone
        return ''

class UserProfileSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', read_only=True)
    email = serializers.EmailField(source='user.email', read_only=True)
    
    class Meta:
        model = UserProfile
        fields = ['id', 'user', 'username', 'email', 'role', 'roll_number', 'department', 'year', 'phone', 'created_at']
        read_only_fields = ['id', 'created_at']

class EventSerializer(serializers.ModelSerializer):
    registered_count = serializers.IntegerField(read_only=True)
    is_registered = serializers.SerializerMethodField()
    created_by_name = serializers.CharField(source='created_by.username', read_only=True)
    
    class Meta:
        model = Event
        fields = ['id', 'name', 'description', 'category', 'date', 'venue', 'capacity', 
                 'registration_deadline', 'image', 'created_by', 'created_by_name', 
                 'created_at', 'registered_count', 'is_registered']
        read_only_fields = ['id', 'created_by', 'created_at', 'registered_count']
    
    def get_is_registered(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return EventRegistration.objects.filter(
                event=obj, 
                user=request.user,
                status='registered'
            ).exists()
        return False

class EventRegistrationSerializer(serializers.ModelSerializer):
    event_name = serializers.CharField(source='event.name', read_only=True)
    user_name = serializers.CharField(source='user.username', read_only=True)
    
    class Meta:
        model = EventRegistration
        fields = ['id', 'event', 'event_name', 'user', 'user_name', 'status', 'registered_at', 'attended_at']
        read_only_fields = ['id', 'registered_at', 'attended_at']

class HolidaySerializer(serializers.ModelSerializer):
    class Meta:
        model = Holiday
        fields = ['id', 'title', 'description', 'date', 'is_public_holiday', 'academic_break', 'created_at']
        read_only_fields = ['id', 'created_at']

class AnnouncementSerializer(serializers.ModelSerializer):
    created_by_name = serializers.CharField(source='created_by.username', read_only=True)
    
    class Meta:
        model = Announcement
        fields = ['id', 'title', 'content', 'created_by', 'created_by_name', 'created_at', 'updated_at', 'is_active']
        read_only_fields = ['id', 'created_by', 'created_at', 'updated_at']

class GallerySerializer(serializers.ModelSerializer):
    likes_count = serializers.IntegerField(read_only=True)
    is_liked = serializers.SerializerMethodField()
    uploaded_by_name = serializers.CharField(source='uploaded_by.username', read_only=True)
    
    class Meta:
        model = Gallery
        fields = ['id', 'title', 'description', 'category', 'image', 'uploaded_by', 'uploaded_by_name', 
                 'likes', 'likes_count', 'is_liked', 'created_at', 'updated_at']
        read_only_fields = ['id', 'uploaded_by', 'created_at', 'updated_at', 'likes_count']
    
    def get_is_liked(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return request.user in obj.likes.all()
        return False

class ChampionSerializer(serializers.ModelSerializer):
    user_name = serializers.CharField(source='user.username', read_only=True)
    
    class Meta:
        model = Champion
        fields = ['id', 'user', 'user_name', 'title', 'category', 'achievement', 'points', 
                 'medal', 'year', 'image', 'certificate', 'awarded_date', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']

class MomentSerializer(serializers.ModelSerializer):
    likes_count = serializers.IntegerField(read_only=True)
    is_liked = serializers.SerializerMethodField()
    user_name = serializers.CharField(source='user.username', read_only=True)
    event_name = serializers.CharField(source='event.name', read_only=True, allow_null=True)
    
    class Meta:
        model = Moment
        fields = ['id', 'event', 'event_name', 'user', 'user_name', 'caption', 'media', 
                 'media_type', 'likes', 'likes_count', 'is_liked', 'created_at', 'updated_at']
        read_only_fields = ['id', 'user', 'created_at', 'updated_at', 'likes_count']
    
    def get_is_liked(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return request.user in obj.likes.all()
        return False

class ChatMessageSerializer(serializers.ModelSerializer):
    user_name = serializers.CharField(source='user.username', read_only=True)
    
    class Meta:
        model = ChatMessage
        fields = ['id', 'room', 'user', 'user_name', 'message', 'is_read', 'created_at']
        read_only_fields = ['id', 'user', 'created_at']

class AttendanceSerializer(serializers.ModelSerializer):
    event_name = serializers.CharField(source='event.name', read_only=True)
    user_name = serializers.CharField(source='user.username', read_only=True)
    verified_by_name = serializers.CharField(source='verified_by.username', read_only=True, allow_null=True)
    
    class Meta:
        model = Attendance
        fields = ['id', 'event', 'event_name', 'user', 'user_name', 'check_in_time', 
                 'verified_by', 'verified_by_name', 'created_at']
        read_only_fields = ['id', 'created_at']