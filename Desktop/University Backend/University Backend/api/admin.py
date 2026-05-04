from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from django.contrib.auth.models import User
from .models import *

# Unregister the default User admin to customize it
admin.site.unregister(User)

# Custom User Admin to show all user fields
@admin.register(User)
class CustomUserAdmin(UserAdmin):
    list_display = ('username', 'email', 'first_name', 'last_name', 'is_staff', 'is_active', 'date_joined')
    list_filter = ('is_staff', 'is_active', 'date_joined')
    search_fields = ('username', 'email', 'first_name', 'last_name')
    
    fieldsets = UserAdmin.fieldsets + (
        ('Additional Info', {
            'fields': (),
        }),
    )

# UserProfile Admin
@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
    list_display = ['user', 'role', 'roll_number', 'department', 'year', 'phone', 'created_at']
    list_filter = ['role', 'year', 'created_at']
    search_fields = ['user__username', 'user__email', 'roll_number', 'phone']
    readonly_fields = ['created_at']
    
    fieldsets = (
        ('User Information', {
            'fields': ('user', 'role', 'roll_number', 'department', 'year', 'phone')
        }),
        ('Timestamps', {
            'fields': ('created_at',),
            'classes': ('collapse',)
        })
    )

# Event Admin
@admin.register(Event)
class EventAdmin(admin.ModelAdmin):
    list_display = ['name', 'category', 'date', 'venue', 'capacity', 'registered_count', 'created_by']
    list_filter = ['category', 'date', 'created_at']
    search_fields = ['name', 'description', 'venue']
    readonly_fields = ['created_at', 'registered_count']
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('name', 'description', 'category', 'image')
        }),
        ('Event Details', {
            'fields': ('date', 'venue', 'capacity', 'registration_deadline')
        }),
        ('Creator', {
            'fields': ('created_by',),
            'classes': ('collapse',)
        }),
        ('Metadata', {
            'fields': ('created_at',),
            'classes': ('collapse',)
        })
    )
    
    def registered_count(self, obj):
        return obj.registrations.filter(status='registered').count()
    registered_count.short_description = 'Registered Count'
    
    def save_model(self, request, obj, form, change):
        if not obj.created_by:
            obj.created_by = request.user
        super().save_model(request, obj, form, change)

# EventRegistration Admin
@admin.register(EventRegistration)
class EventRegistrationAdmin(admin.ModelAdmin):
    list_display = ['event', 'user', 'status', 'registered_at']
    list_filter = ['status', 'registered_at', 'event__category']
    search_fields = ['event__name', 'user__username']
    readonly_fields = ['registered_at']
    
    fieldsets = (
        ('Registration Details', {
            'fields': ('event', 'user', 'status')
        }),
        ('Timestamps', {
            'fields': ('registered_at',),
            'classes': ('collapse',)
        })
    )

# Holiday Admin
@admin.register(Holiday)
class HolidayAdmin(admin.ModelAdmin):
    list_display = ['title', 'date', 'is_public_holiday', 'academic_break']
    list_filter = ['is_public_holiday', 'academic_break', 'date']
    search_fields = ['title', 'description']
    date_hierarchy = 'date'
    
    fieldsets = (
        ('Holiday Information', {
            'fields': ('title', 'description', 'date', 'is_public_holiday', 'academic_break')
        }),
    )

# Announcement Admin
@admin.register(Announcement)
class AnnouncementAdmin(admin.ModelAdmin):
    list_display = ['title', 'created_by', 'created_at', 'is_active']
    list_filter = ['is_active', 'created_at']
    search_fields = ['title', 'content']
    readonly_fields = ['created_at']
    
    fieldsets = (
        ('Announcement', {
            'fields': ('title', 'content', 'is_active')
        }),
        ('Author', {
            'fields': ('created_by',),
            'classes': ('collapse',)
        }),
        ('Timestamps', {
            'fields': ('created_at',),
            'classes': ('collapse',)
        })
    )

# Gallery Admin
@admin.register(Gallery)
class GalleryAdmin(admin.ModelAdmin):
    list_display = ['title', 'category', 'uploaded_by', 'get_likes_count', 'created_at']
    list_filter = ['category', 'created_at']
    search_fields = ['title', 'description']
    readonly_fields = ['created_at']
    filter_horizontal = ['likes']
    
    fieldsets = (
        ('Gallery Information', {
            'fields': ('title', 'description', 'category', 'image')
        }),
        ('Uploader', {
            'fields': ('uploaded_by',),
            'classes': ('collapse',)
        }),
        ('Likes', {
            'fields': ('likes',),
            'classes': ('collapse',)
        }),
        ('Timestamps', {
            'fields': ('created_at',),
            'classes': ('collapse',)
        })
    )
    
    def get_likes_count(self, obj):
        return obj.likes.count()
    get_likes_count.short_description = 'Likes Count'

# Champion Admin
@admin.register(Champion)
class ChampionAdmin(admin.ModelAdmin):
    list_display = ['user', 'title', 'category', 'points', 'medal', 'year']
    list_filter = ['category', 'medal', 'year']
    search_fields = ['user__username', 'title', 'achievement']
    
    fieldsets = (
        ('Champion Information', {
            'fields': ('user', 'title', 'category', 'achievement', 'points', 'medal')
        }),
        ('Details', {
            'fields': ('year', 'image')
        }),
    )

# Moment Admin
@admin.register(Moment)
class MomentAdmin(admin.ModelAdmin):
    list_display = ['user', 'caption_preview', 'media_type', 'get_likes_count', 'created_at']
    list_filter = ['media_type', 'created_at']
    search_fields = ['caption', 'user__username']
    readonly_fields = ['created_at']
    filter_horizontal = ['likes']
    
    fieldsets = (
        ('Moment Information', {
            'fields': ('user', 'caption', 'media_type', 'media')
        }),
        ('Event', {
            'fields': ('event',),
            'classes': ('collapse',)
        }),
        ('Likes', {
            'fields': ('likes',),
            'classes': ('collapse',)
        }),
        ('Timestamps', {
            'fields': ('created_at',),
            'classes': ('collapse',)
        })
    )
    
    def caption_preview(self, obj):
        return obj.caption[:50] + '...' if len(obj.caption) > 50 else obj.caption
    caption_preview.short_description = 'Caption'
    
    def get_likes_count(self, obj):
        return obj.likes.count()
    get_likes_count.short_description = 'Likes'

# ChatMessage Admin
@admin.register(ChatMessage)
class ChatMessageAdmin(admin.ModelAdmin):
    list_display = ['room', 'user', 'message_preview', 'created_at']
    list_filter = ['room', 'created_at']
    search_fields = ['room', 'user__username', 'message']
    readonly_fields = ['created_at']
    
    fieldsets = (
        ('Message Details', {
            'fields': ('room', 'user', 'message')
        }),
        ('Timestamps', {
            'fields': ('created_at',),
            'classes': ('collapse',)
        })
    )
    
    def message_preview(self, obj):
        return obj.message[:50] + '...' if len(obj.message) > 50 else obj.message
    message_preview.short_description = 'Message'

# Attendance Admin
@admin.register(Attendance)
class AttendanceAdmin(admin.ModelAdmin):
    list_display = ['event', 'user', 'check_in_time', 'verified_by', 'created_at']
    list_filter = ['event', 'created_at']
    search_fields = ['event__name', 'user__username']
    readonly_fields = ['created_at']
    
    fieldsets = (
        ('Attendance Details', {
            'fields': ('event', 'user', 'check_in_time', 'verified_by')
        }),
        ('Timestamps', {
            'fields': ('created_at',),
            'classes': ('collapse',)
        })
    )

# Set admin site header
admin.site.site_header = 'University Event Management System'
admin.site.site_title = 'University EMS Admin'
admin.site.index_title = 'Welcome to University Event Management System'