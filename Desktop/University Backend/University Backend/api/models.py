from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone

class UserProfile(models.Model):
    ROLE_CHOICES = [
        ('student', 'Student'),
        ('leader', 'Event Leader'),
        ('admin', 'Admin'),
    ]
    
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    role = models.CharField(max_length=10, choices=ROLE_CHOICES, default='student')
    roll_number = models.CharField(max_length=20, blank=True, null=True)
    department = models.CharField(max_length=100, blank=True, null=True)
    year = models.IntegerField(blank=True, null=True)
    phone = models.CharField(max_length=15, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        verbose_name = 'User Profile'
        verbose_name_plural = 'User Profiles'
    
    def __str__(self):
        return f"{self.user.username} - {self.role}"

class Event(models.Model):
    CATEGORY_CHOICES = [
        ('academic', 'Academic'),
        ('cultural', 'Cultural'),
        ('sports', 'Sports'),
        ('technical', 'Technical'),
        ('workshop', 'Workshop'),
    ]
    
    name = models.CharField(max_length=200)
    description = models.TextField()
    category = models.CharField(max_length=20, choices=CATEGORY_CHOICES)
    date = models.DateTimeField()
    venue = models.CharField(max_length=200)
    capacity = models.IntegerField()
    registration_deadline = models.DateTimeField()
    image = models.ImageField(upload_to='events/', blank=True, null=True)
    created_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='created_events')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)  # Added
    
    class Meta:
        ordering = ['-date']
        verbose_name = 'Event'
        verbose_name_plural = 'Events'
    
    def __str__(self):
        return self.name
    
    @property
    def registered_count(self):
        return self.registrations.filter(status='registered').count()

class EventRegistration(models.Model):
    STATUS_CHOICES = [
        ('registered', 'Registered'),
        ('attended', 'Attended'),
        ('cancelled', 'Cancelled'),
    ]
    
    event = models.ForeignKey(Event, on_delete=models.CASCADE, related_name='registrations')
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='event_registrations')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='registered')
    registered_at = models.DateTimeField(auto_now_add=True)
    attended_at = models.DateTimeField(null=True, blank=True)  # Added
    
    class Meta:
        unique_together = ['event', 'user']
        ordering = ['-registered_at']
        verbose_name = 'Event Registration'
        verbose_name_plural = 'Event Registrations'
    
    def __str__(self):
        return f"{self.user.username} - {self.event.name}"

class Holiday(models.Model):
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    date = models.DateField()
    is_public_holiday = models.BooleanField(default=True)
    academic_break = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)  # Added
    
    class Meta:
        ordering = ['date']
        verbose_name = 'Holiday'
        verbose_name_plural = 'Holidays'
    
    def __str__(self):
        return f"{self.title} - {self.date}"

class Announcement(models.Model):
    title = models.CharField(max_length=200)
    content = models.TextField()
    created_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='announcements')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)  # Added
    is_active = models.BooleanField(default=True)  # Changed from is_global to is_active
    
    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Announcement'
        verbose_name_plural = 'Announcements'
    
    def __str__(self):
        return self.title

class Gallery(models.Model):
    CATEGORY_CHOICES = [
        ('event', 'Event'),
        ('cultural', 'Cultural'),
        ('sports', 'Sports'),
        ('workshop', 'Workshop'),
        ('academic', 'Academic'),
        ('general', 'General'),  # Added
    ]
    
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    category = models.CharField(max_length=20, choices=CATEGORY_CHOICES, default='event')
    image = models.ImageField(upload_to='gallery/')
    uploaded_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='gallery_images')
    likes = models.ManyToManyField(User, related_name='liked_images', blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)  # Added
    
    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Gallery'
        verbose_name_plural = 'Gallery'
    
    def __str__(self):
        return self.title
    
    @property
    def likes_count(self):
        return self.likes.count()

class Champion(models.Model):
    MEDAL_CHOICES = [
        ('gold', 'Gold'),
        ('silver', 'Silver'),
        ('bronze', 'Bronze'),
        ('platinum', 'Platinum'),  # Added
    ]
    
    CATEGORY_CHOICES = [
        ('academic', 'Academic'),
        ('technical', 'Technical'),
        ('cultural', 'Cultural'),
        ('sports', 'Sports'),
        ('community', 'Community'),
        ('leadership', 'Leadership'),  # Added
        ('innovation', 'Innovation'),  # Added
    ]
    
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='champion_profile')
    title = models.CharField(max_length=200)
    category = models.CharField(max_length=20, choices=CATEGORY_CHOICES, default='academic')
    achievement = models.TextField()
    points = models.IntegerField(default=0)
    medal = models.CharField(max_length=10, choices=MEDAL_CHOICES, default='bronze')
    year = models.IntegerField()
    image = models.ImageField(upload_to='champions/', blank=True, null=True)
    certificate = models.FileField(upload_to='certificates/', blank=True, null=True)  # Added
    awarded_date = models.DateTimeField(default=timezone.now)  # Added
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)  # Added
    
    class Meta:
        ordering = ['-points', '-awarded_date']
        verbose_name = 'Champion'
        verbose_name_plural = 'Champions'
    
    def __str__(self):
        return f"{self.user.username} - {self.title}"

class Moment(models.Model):
    MEDIA_CHOICES = [
        ('image', 'Image'),
        ('video', 'Video'),
    ]
    
    event = models.ForeignKey(Event, on_delete=models.CASCADE, related_name='moments', null=True, blank=True)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='moments')
    caption = models.TextField()
    media = models.FileField(upload_to='moments/')
    media_type = models.CharField(max_length=10, choices=MEDIA_CHOICES, default='image')
    likes = models.ManyToManyField(User, related_name='liked_moments', blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)  # Added
    
    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Moment'
        verbose_name_plural = 'Moments'
    
    def __str__(self):
        return f"{self.user.username} - {self.caption[:50]}"
    
    @property
    def likes_count(self):
        return self.likes.count()

class ChatMessage(models.Model):
    room = models.CharField(max_length=100)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='chat_messages')
    message = models.TextField()
    is_read = models.BooleanField(default=False)  # Added
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['created_at']
        verbose_name = 'Chat Message'
        verbose_name_plural = 'Chat Messages'
    
    def __str__(self):
        return f"{self.user.username}: {self.message[:50]}"

class Attendance(models.Model):
    event = models.ForeignKey(Event, on_delete=models.CASCADE, related_name='attendance_records')
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='attendance_records')
    check_in_time = models.DateTimeField(default=timezone.now)  # Changed from auto_now_add
    verified_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='verified_attendances', null=True)
    created_at = models.DateTimeField(auto_now_add=True)  # Added
    
    class Meta:
        unique_together = ['event', 'user']
        ordering = ['-check_in_time']
        verbose_name = 'Attendance'
        verbose_name_plural = 'Attendances'
    
    def __str__(self):
        return f"{self.user.username} - {self.event.name} - {self.check_in_time}"