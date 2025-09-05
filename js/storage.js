// storage.js - 로컬스토리지 관리

const Storage = {
    // 사용자 관련
    getUser: function() {
        const user = localStorage.getItem('currentUser');
        return user ? JSON.parse(user) : null;
    },
    
    setUser: function(user) {
        localStorage.setItem('currentUser', JSON.stringify(user));
    },
    
    removeUser: function() {
        localStorage.removeItem('currentUser');
    },
    
    // 사용자 목록 관련
    getUsers: function() {
        const users = localStorage.getItem('users');
        return users ? JSON.parse(users) : [];
    },
    
    setUsers: function(users) {
        localStorage.setItem('users', JSON.stringify(users));
    },
    
    addUser: function(user) {
        const users = this.getUsers();
        users.push(user);
        this.setUsers(users);
    },
    
    findUser: function(email, password) {
        const users = this.getUsers();
        return users.find(u => u.email === email && u.password === password);
    },
    
    userExists: function(email) {
        const users = this.getUsers();
        return users.some(u => u.email === email);
    },
    
    // 예약 관련
    getBookings: function() {
        const bookings = localStorage.getItem('bookings');
        return bookings ? JSON.parse(bookings) : [];
    },
    
    setBookings: function(bookings) {
        localStorage.setItem('bookings', JSON.stringify(bookings));
    },
    
    addBooking: function(booking) {
        const bookings = this.getBookings();
        bookings.push(booking);
        this.setBookings(bookings);
        this.incrementBookingCounter();
    },
    
    getUserBookings: function(userId) {
        const bookings = this.getBookings();
        return bookings.filter(b => b.userId === userId);
    },
    
    updateBookingStatus: function(bookingNumber, status) {
        const bookings = this.getBookings();
        const index = bookings.findIndex(b => b.bookingNumber === bookingNumber);
        if (index !== -1) {
            bookings[index].status = status;
            this.setBookings(bookings);
        }
    },
    
    // 예약 카운터
    getBookingCounter: function() {
        const counter = localStorage.getItem('bookingCounter');
        return counter ? parseInt(counter) : 0;
    },
    
    incrementBookingCounter: function() {
        const counter = this.getBookingCounter();
        localStorage.setItem('bookingCounter', String(counter + 1));
    },
    
    // 테스트 데이터 초기화 (개발 환경에서만 사용)
    initTestUsers: function() {
        // 퍼블릭 버전에서는 테스트 데이터 제거됨
        console.log('Test data initialization skipped in production');
    },
    
};
