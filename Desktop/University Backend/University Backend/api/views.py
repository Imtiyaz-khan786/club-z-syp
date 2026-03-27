from rest_framework import viewsets, status, generics
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated, IsAdminUser
from rest_framework_simplejwt.tokens import RefreshToken
from django.db.models import Q
from django.utils import timezone
from django.contrib.auth.models import User
from .models import *
from .serializers import *
from rest_framework.views import APIView

class RegisterView(APIView):
    permission_classes = [AllowAny]
    
    def post(self, request):
        try:
            username = request.data.get('username')
            email = request.data.get('email')
            password = request.data.get('password')
            role = request.data.get('role', 'student')
            first_name = request.data.get('first_name', '')
            last_name = request.data.get('last_name', '')
            roll_number = request.data.get('roll_number', '')
            department = request.data.get('department', '')
            year = request.data.get('year')
            phone = request.data.get('phone', '')
            
            # Validate required fields
            if not username:
                return Response({'error': 'Username is required'}, status=status.HTTP_400_BAD_REQUEST)
            if not email:
                return Response({'error': 'Email is required'}, status=status.HTTP_400_BAD_REQUEST)
            if not password:
                return Response({'error': 'Password is required'}, status=status.HTTP_400_BAD_REQUEST)
            
            # Check if username exists
            if User.objects.filter(username=username).exists():
                return Response({'error': 'Username already exists'}, status=status.HTTP_400_BAD_REQUEST)
            
            # Check if email exists
            if User.objects.filter(email=email).exists():
                return Response({'error': 'Email already exists'}, status=status.HTTP_400_BAD_REQUEST)
            
            # Create user
            user = User.objects.create_user(
                username=username,
                email=email,
                password=password,
                first_name=first_name,
                last_name=last_name
            )
            
            # Create user profile
            user_profile = UserProfile.objects.create(
                user=user,
                role=role,
                roll_number=roll_number,
                department=department,
                year=year if year else None,
                phone=phone
            )
            
            # Generate tokens
            refresh = RefreshToken.for_user(user)
            
            # Return response
            return Response({
                'success': True,
                'message': 'Registration successful',
                'refresh': str(refresh),
                'access': str(refresh.access_token),
                'user': {
                    'id': user.id,
                    'username': user.username,
                    'email': user.email,
                    'first_name': user.first_name,
                    'last_name': user.last_name,
                    'role': user_profile.role,
                    'phone': user_profile.phone,
                    'roll_number': user_profile.roll_number,
                    'department': user_profile.department,
                    'year': user_profile.year
                }
            }, status=status.HTTP_201_CREATED)
            
        except Exception as e:
            print(f"Registration error: {str(e)}")
            return Response({
                'error': 'Registration failed',
                'details': str(e)
            }, status=status.HTTP_400_BAD_REQUEST)

class LoginView(generics.GenericAPIView):
    permission_classes = [AllowAny]
    
    def post(self, request):
        username = request.data.get('username')
        password = request.data.get('password')
        
        try:
            user = User.objects.get(username=username)
            if user.check_password(password):
                refresh = RefreshToken.for_user(user)
                
                # Get user profile
                try:
                    user_profile = UserProfile.objects.get(user=user)
                except UserProfile.DoesNotExist:
                    # Create profile if it doesn't exist
                    user_profile = UserProfile.objects.create(user=user, role='student')
                
                return Response({
                    'success': True,
                    'refresh': str(refresh),
                    'access': str(refresh.access_token),
                    'user': {
                        'id': user.id,
                        'username': user.username,
                        'email': user.email,
                        'first_name': user.first_name,
                        'last_name': user.last_name,
                        'role': user_profile.role,
                        'phone': user_profile.phone,
                        'roll_number': user_profile.roll_number,
                        'department': user_profile.department,
                        'year': user_profile.year
                    }
                })
        except User.DoesNotExist:
            pass
        
        return Response({'error': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)

class EventViewSet(viewsets.ModelViewSet):
    queryset = Event.objects.all().order_by('date')
    serializer_class = EventSerializer
    
    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            self.permission_classes = [IsAuthenticated, IsAdminUser]
        else:
            self.permission_classes = [AllowAny]
        return super().get_permissions()
    
    def get_serializer_context(self):
        context = super().get_serializer_context()
        context.update({"request": self.request})
        return context
    
    def get_queryset(self):
        queryset = Event.objects.all()
        category = self.request.query_params.get('category')
        search = self.request.query_params.get('search')
        
        if category:
            queryset = queryset.filter(category=category)
        if search:
            queryset = queryset.filter(Q(name__icontains=search) | Q(description__icontains=search))
        
        return queryset.order_by('date')
    
    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)
    
    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated])
    def register(self, request, pk=None):
        event = self.get_object()
        
        if EventRegistration.objects.filter(event=event, user=request.user).exists():
            return Response({'error': 'Already registered'}, status=status.HTTP_400_BAD_REQUEST)
        
        if event.registered_count >= event.capacity:
            return Response({'error': 'Event is full'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Check if event has already passed
        if event.date < timezone.now():
            return Response({'error': 'Event has already passed'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Check registration deadline
        if event.registration_deadline < timezone.now():
            return Response({'error': 'Registration deadline has passed'}, status=status.HTTP_400_BAD_REQUEST)
        
        EventRegistration.objects.create(event=event, user=request.user)
        return Response({'message': 'Registered successfully'})
    
    @action(detail=True, methods=['get'], permission_classes=[IsAuthenticated])
    def check_registration(self, request, pk=None):
        event = self.get_object()
        is_registered = EventRegistration.objects.filter(
            event=event, 
            user=request.user,
            status='registered'
        ).exists()
        return Response({'is_registered': is_registered})
    
    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated])
    def cancel_registration(self, request, pk=None):
        event = self.get_object()
        registration = EventRegistration.objects.filter(event=event, user=request.user)
        
        if not registration.exists():
            return Response({'error': 'Not registered for this event'}, status=status.HTTP_400_BAD_REQUEST)
        
        registration.delete()
        return Response({'message': 'Registration cancelled successfully'})
    
    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated])
    def mark_attendance(self, request, pk=None):
        event = self.get_object()
        user_id = request.data.get('user_id')
        
        # Get user role from profile
        user_role = request.user.profile.role if hasattr(request.user, 'profile') else 'student'
        
        # If admin is marking attendance for another user
        if user_id and user_id != 'current' and user_role != 'admin':
            return Response({'error': 'Only admins can mark attendance for others'}, status=status.HTTP_403_FORBIDDEN)
        
        target_user = request.user
        if user_id and user_id != 'current':
            try:
                target_user = User.objects.get(id=user_id)
            except User.DoesNotExist:
                return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)
        
        try:
            registration = EventRegistration.objects.get(event=event, user=target_user)
            if registration.status != 'attended':
                registration.status = 'attended'
                registration.attended_at = timezone.now()
                registration.save()
            
            # Create or update attendance record
            attendance, created = Attendance.objects.get_or_create(
                event=event,
                user=target_user,
                defaults={'verified_by': request.user, 'check_in_time': timezone.now()}
            )
            
            return Response({'message': 'Attendance marked successfully'})
        except EventRegistration.DoesNotExist:
            return Response({'error': 'User not registered for this event'}, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=True, methods=['get'], permission_classes=[IsAuthenticated])
    def participants(self, request, pk=None):
        event = self.get_object()
        registrations = event.registrations.all()
        serializer = EventRegistrationSerializer(registrations, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated])
    def my_registrations(self, request):
        registrations = EventRegistration.objects.filter(user=request.user, status='registered')
        serializer = EventRegistrationSerializer(registrations, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'], permission_classes=[AllowAny])
    def upcoming(self, request):
        upcoming_events = Event.objects.filter(date__gte=timezone.now()).order_by('date')[:10]
        serializer = self.get_serializer(upcoming_events, many=True)
        return Response(serializer.data)

class HolidayViewSet(viewsets.ModelViewSet):
    queryset = Holiday.objects.all().order_by('date')
    serializer_class = HolidaySerializer
    
    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            self.permission_classes = [IsAuthenticated, IsAdminUser]
        else:
            self.permission_classes = [AllowAny]
        return super().get_permissions()
    
    def get_queryset(self):
        queryset = super().get_queryset()
        year = self.request.query_params.get('year')
        if year:
            queryset = queryset.filter(date__year=year)
        return queryset

class AnnouncementViewSet(viewsets.ModelViewSet):
    queryset = Announcement.objects.filter(is_active=True).order_by('-created_at')
    serializer_class = AnnouncementSerializer
    
    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            self.permission_classes = [IsAuthenticated, IsAdminUser]
        else:
            self.permission_classes = [AllowAny]
        return super().get_permissions()
    
    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)

class GalleryViewSet(viewsets.ModelViewSet):
    queryset = Gallery.objects.all().order_by('-created_at')
    serializer_class = GallerySerializer
    
    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            self.permission_classes = [IsAuthenticated]
        else:
            self.permission_classes = [AllowAny]
        return super().get_permissions()
    
    def get_serializer_context(self):
        context = super().get_serializer_context()
        context.update({"request": self.request})
        return context
    
    def perform_create(self, serializer):
        serializer.save(uploaded_by=self.request.user)
    
    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated])
    def like(self, request, pk=None):
        gallery = self.get_object()
        if request.user in gallery.likes.all():
            gallery.likes.remove(request.user)
            return Response({'liked': False, 'likes_count': gallery.likes.count()})
        else:
            gallery.likes.add(request.user)
            return Response({'liked': True, 'likes_count': gallery.likes.count()})

class ChampionViewSet(viewsets.ModelViewSet):
    queryset = Champion.objects.all().order_by('-points')
    serializer_class = ChampionSerializer
    
    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            self.permission_classes = [IsAuthenticated, IsAdminUser]
        else:
            self.permission_classes = [AllowAny]
        return super().get_permissions()

class MomentViewSet(viewsets.ModelViewSet):
    queryset = Moment.objects.all().order_by('-created_at')
    serializer_class = MomentSerializer
    
    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            self.permission_classes = [IsAuthenticated]
        else:
            self.permission_classes = [AllowAny]
        return super().get_permissions()
    
    def get_serializer_context(self):
        context = super().get_serializer_context()
        context.update({"request": self.request})
        return context
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
    
    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated])
    def like(self, request, pk=None):
        moment = self.get_object()
        if request.user in moment.likes.all():
            moment.likes.remove(request.user)
            return Response({'liked': False, 'likes_count': moment.likes.count()})
        else:
            moment.likes.add(request.user)
            return Response({'liked': True, 'likes_count': moment.likes.count()})

class ChatMessageViewSet(viewsets.ModelViewSet):
    queryset = ChatMessage.objects.all().order_by('created_at')
    serializer_class = ChatMessageSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        room = self.request.query_params.get('room')
        if room:
            return self.queryset.filter(room=room)[:100]
        return self.queryset.none()
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class AttendanceViewSet(viewsets.ModelViewSet):
    queryset = Attendance.objects.all().order_by('-check_in_time')
    serializer_class = AttendanceSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        queryset = super().get_queryset()
        # Get user role from profile
        user_role = self.request.user.profile.role if hasattr(self.request.user, 'profile') else 'student'
        # Regular users can only see their own attendance
        if user_role != 'admin':
            queryset = queryset.filter(user=self.request.user)
        return queryset

class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated, IsAdminUser]
    
    def get_queryset(self):
        queryset = super().get_queryset()
        role = self.request.query_params.get('role')
        if role:
            queryset = queryset.filter(profile__role=role)
        return queryset
    
    @action(detail=True, methods=['patch'], permission_classes=[IsAuthenticated, IsAdminUser])
    def update_role(self, request, pk=None):
        user = self.get_object()
        new_role = request.data.get('role', 'student')
        profile, created = UserProfile.objects.get_or_create(user=user)
        profile.role = new_role
        profile.save()
        return Response(UserSerializer(user).data)

class DashboardView(generics.GenericAPIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        upcoming_events = Event.objects.filter(date__gte=timezone.now()).order_by('date')[:5]
        registered_events = EventRegistration.objects.filter(user=request.user, status='registered').select_related('event')[:5]
        upcoming_holidays = Holiday.objects.filter(date__gte=timezone.now().date()).order_by('date')[:5]
        announcements = Announcement.objects.filter(is_active=True).order_by('-created_at')[:5]
        recent_gallery = Gallery.objects.all().order_by('-created_at')[:6]
        
        # Get user stats
        user_stats = {
            'total_events_registered': EventRegistration.objects.filter(user=request.user, status='registered').count(),
            'total_events_attended': Attendance.objects.filter(user=request.user).count(),
            'total_moments': Moment.objects.filter(user=request.user).count(),
            'total_likes_received': sum(moment.likes.count() for moment in Moment.objects.filter(user=request.user))
        }
        
        return Response({
            'upcoming_events': EventSerializer(upcoming_events, many=True, context={'request': request}).data,
            'registered_events': EventRegistrationSerializer(registered_events, many=True).data,
            'upcoming_holidays': HolidaySerializer(upcoming_holidays, many=True).data,
            'announcements': AnnouncementSerializer(announcements, many=True).data,
            'recent_gallery': GallerySerializer(recent_gallery, many=True, context={'request': request}).data,
            'user_stats': user_stats
        })