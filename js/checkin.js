// 定位打卡系統
class CheckinManager {
    constructor() {
        this.currentLocation = null;
        this.isCheckedIn = false;
        this.todayCheckin = null;
        this.map = null;
        this.marker = null;
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadTodayCheckin();
        this.setupMap();
    }

    // 設定事件監聽器
    setupEventListeners() {
        const checkinBtn = document.getElementById('checkin-btn');
        if (checkinBtn) {
            checkinBtn.addEventListener('click', () => {
                this.handleCheckin();
            });
        }
    }

    // 設定地圖
    setupMap() {
        const mapContainer = document.getElementById('map');
        if (!mapContainer) return;

        // 使用簡單的靜態地圖顯示
        mapContainer.innerHTML = `
            <div style="
                width: 100%;
                height: 100%;
                background: linear-gradient(45deg, #f0f0f0 25%, transparent 25%), 
                           linear-gradient(-45deg, #f0f0f0 25%, transparent 25%), 
                           linear-gradient(45deg, transparent 75%, #f0f0f0 75%), 
                           linear-gradient(-45deg, transparent 75%, #f0f0f0 75%);
                background-size: 20px 20px;
                background-position: 0 0, 0 10px, 10px -10px, -10px 0px;
                display: flex;
                align-items: center;
                justify-content: center;
                color: #666;
                font-size: 16px;
                border: 2px dashed #ccc;
                border-radius: 8px;
            ">
                <div style="text-align: center;">
                    <i class="fas fa-map-marked-alt" style="font-size: 48px; margin-bottom: 10px; color: #667eea;"></i>
                    <p>地圖載入中...</p>
                    <p style="font-size: 12px; margin-top: 5px;">點擊打卡按鈕獲取位置</p>
                </div>
            </div>
        `;

        // 嘗試載入真實地圖（需要網路連接）
        this.loadRealMap();
    }

    // 載入真實地圖
    loadRealMap() {
        // 檢查是否支援地理定位
        if (!navigator.geolocation) {
            this.updateLocationInfo('您的瀏覽器不支援地理定位功能');
            return;
        }

        // 取得當前位置
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const lat = position.coords.latitude;
                const lng = position.coords.longitude;
                
                this.currentLocation = { lat, lng };
                this.displayMap(lat, lng);
                this.updateLocationInfo(`緯度: ${lat.toFixed(6)}, 經度: ${lng.toFixed(6)}`);
            },
            (error) => {
                console.error('取得位置失敗:', error);
                this.updateLocationInfo('無法取得您的位置，請確保已開啟定位服務');
            },
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 300000 // 5 分鐘的快取
            }
        );
    }

    // 顯示地圖
    displayMap(lat, lng) {
        const mapContainer = document.getElementById('map');
        if (!mapContainer) return;

        // 使用 OpenStreetMap 的靜態地圖
        const mapUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${lng-0.01}%2C${lat-0.01}%2C${lng+0.01}%2C${lat+0.01}&layer=mapnik&marker=${lat}%2C${lng}`;
        
        mapContainer.innerHTML = `
            <iframe 
                width="100%" 
                height="100%" 
                frameborder="0" 
                scrolling="no" 
                marginheight="0" 
                marginwidth="0" 
                src="${mapUrl}"
                style="border: 1px solid #ccc; border-radius: 8px;"
            ></iframe>
            <div style="
                position: absolute;
                top: 10px;
                left: 10px;
                background: white;
                padding: 8px 12px;
                border-radius: 4px;
                box-shadow: 0 2px 8px rgba(0,0,0,0.2);
                font-size: 12px;
                font-weight: bold;
                color: #333;
            ">
                <i class="fas fa-map-marker-alt" style="color: #dc3545; margin-right: 5px;"></i>
                您的位置
            </div>
        `;

        // 設定相對定位以便顯示位置資訊
        mapContainer.style.position = 'relative';
    }

    // 載入今日打卡記錄
    async loadTodayCheckin() {
        try {
            const user = window.authManager.currentUser;
            if (!user) return;

            const today = new Date().toISOString().split('T')[0];
            
            const checkinSnapshot = await firebaseApp.db
                .collection('checkins')
                .where('userId', '==', user.uid)
                .where('date', '==', today)
                .orderBy('checkinTime', 'desc')
                .limit(1)
                .get();

            if (!checkinSnapshot.empty) {
                const checkinData = checkinSnapshot.docs[0].data();
                this.todayCheckin = {
                    id: checkinSnapshot.docs[0].id,
                    ...checkinData
                };
                this.isCheckedIn = !checkinData.checkoutTime;
                this.updateCheckinButton();
            }
        } catch (error) {
            console.error('載入今日打卡記錄失敗:', error);
        }
    }

    // 處理打卡
    async handleCheckin() {
        try {
            if (!this.currentLocation) {
                alert('請先允許系統取得您的位置');
                return;
            }

            const user = window.authManager.currentUser;
            if (!user) {
                alert('請先登入');
                return;
            }

            const now = new Date();
            const today = now.toISOString().split('T')[0];
            const currentTime = now.toTimeString().split(' ')[0];

            if (this.isCheckedIn && this.todayCheckin) {
                // 簽退
                await this.handleCheckout(user, currentTime);
            } else {
                // 簽到
                await this.handleCheckinProcess(user, today, currentTime);
            }

        } catch (error) {
            console.error('打卡處理失敗:', error);
            alert('打卡失敗：' + error.message);
        }
    }

    // 處理簽到流程
    async handleCheckinProcess(user, date, time) {
        try {
            const checkinData = {
                userId: user.uid,
                userEmail: user.email,
                userName: user.displayName || user.email.split('@')[0],
                date: date,
                checkinTime: time,
                checkoutTime: null,
                checkinLocation: {
                    latitude: this.currentLocation.lat,
                    longitude: this.currentLocation.lng
                },
                checkinTimestamp: firebase.firestore.FieldValue.serverTimestamp(),
                status: 'active'
            };

            // 檢查是否在工作地點範圍內（簡單的距離檢查）
            const isValidLocation = this.validateCheckinLocation();
            checkinData.locationValid = isValidLocation;

            if (!isValidLocation) {
                checkinData.notes = '打卡位置不在允許範圍內';
            }

            const docRef = await firebaseApp.db.collection('checkins').add(checkinData);
            
            this.todayCheckin = {
                id: docRef.id,
                ...checkinData
            };
            this.isCheckedIn = true;
            
            this.updateCheckinButton();
            this.showCheckinSuccess('簽到成功！');

            // 如果位置無效，建立異常提醒
            if (!isValidLocation) {
                await this.createLocationAlert(checkinData);
            }

        } catch (error) {
            console.error('簽到失敗:', error);
            throw error;
        }
    }

    // 處理簽退流程
    async handleCheckout(user, time) {
        try {
            const checkoutData = {
                checkoutTime: time,
                checkoutLocation: {
                    latitude: this.currentLocation.lat,
                    longitude: this.currentLocation.lng
                },
                checkoutTimestamp: firebase.firestore.FieldValue.serverTimestamp(),
                status: 'completed'
            };

            await firebaseApp.db
                .collection('checkins')
                .doc(this.todayCheckin.id)
                .update(checkoutData);

            this.todayCheckin = {
                ...this.todayCheckin,
                ...checkoutData
            };
            this.isCheckedIn = false;
            
            this.updateCheckinButton();
            this.showCheckinSuccess('簽退成功！');

        } catch (error) {
            console.error('簽退失敗:', error);
            throw error;
        }
    }

    // 驗證打卡位置
    validateCheckinLocation() {
        // 這裡可以設定工作地點的經緯度和允許的誤差範圍（以公尺為單位）
        const workplace = {
            latitude: 25.0330,  // 台北車站附近（範例）
            longitude: 121.5654,
            radius: 1000  // 1 公里範圍
        };

        if (!this.currentLocation) return false;

        const distance = this.calculateDistance(
            this.currentLocation.lat,
            this.currentLocation.lng,
            workplace.latitude,
            workplace.longitude
        );

        return distance <= workplace.radius;
    }

    // 計算兩點間的距離（使用 Haversine 公式）
    calculateDistance(lat1, lng1, lat2, lng2) {
        const R = 6371000; // 地球半徑（公尺）
        const φ1 = lat1 * Math.PI / 180;
        const φ2 = lat2 * Math.PI / 180;
        const Δφ = (lat2 - lat1) * Math.PI / 180;
        const Δλ = (lng2 - lng1) * Math.PI / 180;

        const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
                Math.cos(φ1) * Math.cos(φ2) *
                Math.sin(Δλ/2) * Math.sin(Δλ/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

        return R * c;
    }

    // 更新打卡按鈕狀態
    updateCheckinButton() {
        const checkinBtn = document.getElementById('checkin-btn');
        if (!checkinBtn) return;

        if (this.isCheckedIn) {
            checkinBtn.innerHTML = '<i class="fas fa-sign-out-alt"></i>簽退';
            checkinBtn.className = 'btn btn-warning';
        } else {
            checkinBtn.innerHTML = '<i class="fas fa-map-marker-alt"></i>打卡';
            checkinBtn.className = 'btn btn-success';
        }
    }

    // 更新位置資訊
    updateLocationInfo(message) {
        const locationInfo = document.getElementById('location-info');
        if (locationInfo) {
            locationInfo.innerHTML = `
                <div style="margin-bottom: 10px;">
                    <i class="fas fa-info-circle" style="color: #667eea; margin-right: 5px;"></i>
                    <strong>位置資訊</strong>
                </div>
                <div style="font-size: 12px; color: #666;">
                    ${message}
                </div>
            `;
        }
    }

    // 顯示打卡成功訊息
    showCheckinSuccess(message) {
        // 創建成功提示
        const successDiv = document.createElement('div');
        successDiv.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #28a745;
            color: white;
            padding: 15px 20px;
            border-radius: 5px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            z-index: 1000;
            animation: slideInRight 0.3s ease-out;
        `;
        successDiv.innerHTML = `
            <i class="fas fa-check-circle" style="margin-right: 8px;"></i>
            ${message}
        `;

        document.body.appendChild(successDiv);

        // 3 秒後自動移除
        setTimeout(() => {
            successDiv.style.animation = 'slideOutRight 0.3s ease-in';
            setTimeout(() => {
                document.body.removeChild(successDiv);
            }, 300);
        }, 3000);
    }

    // 建立位置異常提醒
    async createLocationAlert(checkinData) {
        try {
            const alertData = {
                type: 'location_invalid',
                title: '打卡位置異常',
                description: `${checkinData.userName} 的打卡位置不在允許範圍內`,
                userId: checkinData.userId,
                checkinId: checkinData.checkinTimestamp,
                location: checkinData.checkinLocation,
                priority: 'medium'
            };

            if (window.dashboardManager) {
                await window.dashboardManager.createAlert(alertData);
            }
        } catch (error) {
            console.error('建立位置異常提醒失敗:', error);
        }
    }
}

// 初始化打卡管理器
window.checkinManager = new CheckinManager();

// 添加動畫樣式
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOutRight {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);