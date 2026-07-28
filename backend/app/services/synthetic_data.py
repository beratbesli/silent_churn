import random
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from app.models import Customer, EmailMessage, MapsReview, FoodPlatformReview, RiskScore
from app.providers import get_provider_manager
from app.services.analysis import AnalysisService


class SyntheticDataService:
    @classmethod
    def generate_all_data(cls, db_session: Session):
        db_session.query(RiskScore).delete()
        db_session.query(FoodPlatformReview).delete()
        db_session.query(MapsReview).delete()
        db_session.query(EmailMessage).delete()
        db_session.query(Customer).delete()
        db_session.commit()

        cls._generate_fallback_data(db_session)
        AnalysisService.calculate_all_risks_sync(db_session)

    @classmethod
    def _generate_fallback_data(cls, db_session: Session):
        customers_data = [
            {
                "name": "Alice Smith", "trajectory": "happy",
                "emails": [
                    ("Great food today!", "I absolutely loved the pasta carbonara today. The sauce was perfectly creamy and the portions were generous. Will definitely be back this weekend!", 0.85, 0.2, 0.85),
                    ("Catering question", "Hey! Do you guys do catering for private parties? We love your food and my daughter's birthday is coming up. Would love to serve your amazing dishes!", 0.7, 0.3, 0.8),
                    ("Amazing service", "Just wanted to drop a note to say our waitress Maria was absolutely wonderful today. She remembered our usual order and even brought out complimentary dessert. You guys are the best!", 0.9, 0.15, 0.9),
                    ("Weekend reservation", "Hi! Can we book a table for 6 this Saturday at 7pm? We're bringing friends who haven't tried your food yet - can't wait to show them!", 0.75, 0.25, 0.7),
                ],
                "maps_reviews": [(5, "Best Turkish restaurant in the city! The kebabs are authentic and the service is always warm. We come here every week.", 0.9), (5, "Never disappoints. Fresh ingredients, generous portions, and the staff treats you like family.", 0.85)],
                "food_reviews": [(5, "Perfect delivery! Food arrived hot and fresh. The Adana kebab was incredible.", 0.9), (5, "Love ordering from here. Always consistent quality and fast delivery.", 0.8)],
            },
            {
                "name": "Bob Jones", "trajectory": "happy",
                "emails": [
                    ("Loved the new menu!", "The new seasonal menu is fantastic! The grilled sea bass was cooked to perfection. Keep innovating like this!", 0.8, 0.2, 0.8),
                    ("Thank you", "Thanks for the wonderful dinner last night. My wife and I had a great anniversary celebration at your restaurant.", 0.85, 0.3, 0.75),
                    ("Loyalty card", "Hi, I was wondering if you have a loyalty program? We eat here so often it would be great to earn some rewards!", 0.6, 0.35, 0.7),
                ],
                "maps_reviews": [(5, "Outstanding food and atmosphere. The new renovation looks great!", 0.85), (4, "Consistently great food. Parking can be tricky but worth the effort.", 0.65)],
                "food_reviews": [(5, "Best lahmacun in town, hands down!", 0.85), (4, "Good as always. Delivery was slightly slow today but food was perfect.", 0.6)],
            },
            {
                "name": "Fiona Gallagher", "trajectory": "happy",
                "emails": [
                    ("Wonderful evening", "We had such a lovely dinner at your place tonight. The ambiance with the new lighting is beautiful!", 0.8, 0.2, 0.8),
                    ("Dietary options", "I've recently gone vegetarian and I'm so happy to see you have so many options! The stuffed peppers were divine.", 0.75, 0.3, 0.75),
                    ("Birthday celebration", "Thank you for making my mother's 70th birthday dinner so special. The cake was beautiful and she was so touched!", 0.9, 0.2, 0.85),
                ],
                "maps_reviews": [(5, "Excellent vegetarian options! Finally a Turkish place that caters to everyone.", 0.85), (5, "Beautiful decor, amazing food, wonderful staff. Five stars all the way!", 0.9)],
                "food_reviews": [(5, "Veggie pide was absolutely delicious. Best I've ever had!", 0.85), (4, "Great food, good portions. Packaging could be a bit better for delivery.", 0.6)],
            },
            {
                "name": "George Miller", "trajectory": "happy",
                "emails": [
                    ("Business lunch", "We had a great business lunch at your restaurant today. The private dining area was perfect for our meeting.", 0.7, 0.4, 0.7),
                    ("Regular order", "Hi, can I place a standing weekly order? Every Tuesday we'd love the mixed grill platter for 4 delivered to our office.", 0.65, 0.45, 0.65),
                ],
                "maps_reviews": [(5, "Perfect for business meals. Professional service and excellent food.", 0.8), (4, "Great food, reasonable prices for the quality. Recommended!", 0.7)],
                "food_reviews": [(5, "Office favorite! Everyone loves the mixed grill.", 0.8), (5, "Reliable and delicious every time.", 0.75)],
            },
            {
                "name": "Nina Simmons", "trajectory": "happy",
                "emails": [
                    ("Family dinner", "We brought the whole family last night and everyone loved it! Even my picky 5-year-old cleaned his plate.", 0.85, 0.2, 0.8),
                    ("Compliments to chef", "Please pass on our compliments to the chef. The lamb shank was the best I've ever had, anywhere.", 0.9, 0.3, 0.7),
                    ("Christmas booking", "Would love to book your restaurant for Christmas Eve dinner. You made last year's celebration perfect!", 0.8, 0.3, 0.75),
                ],
                "maps_reviews": [(5, "Family-friendly and delicious! Kids menu is actually good quality, not just chicken nuggets.", 0.85), (5, "The lamb shank is a must-try. Melt-in-your-mouth perfection!", 0.9)],
                "food_reviews": [(5, "Fast delivery and the food tasted like it was just made. Amazing!", 0.85), (4, "Always our go-to for family dinners at home.", 0.7)],
            },
            {
                "name": "Charlie Brown", "trajectory": "cooling",
                "emails": [
                    ("Good lunch", "Enjoyed the meal today. The çorba was warming and tasty. Nice job as always.", 0.5, 0.4, 0.6),
                    ("Menu change?", "I noticed the portions seem smaller than before. The food is still good but I feel like you're cutting corners a bit. Just my observation.", 0.1, 0.55, 0.5),
                    ("Late delivery", "My order was 30 minutes late today. The food was lukewarm when it arrived. This is the second time this month. Pretty disappointing.", -0.4, 0.7, 0.4),
                    ("Missing item", "You forgot my drink again. This is the third time. Please issue a refund for the missing ayran. I shouldn't have to keep asking about this.", -0.6, 0.85, 0.25),
                ],
                "maps_reviews": [(4, "Used to be great. Food quality is slipping lately. Portions are definitely smaller.", 0.1), (2, "Went back after a month. Service was slow, food was cold. Very disappointed.", -0.6)],
                "food_reviews": [(4, "Decent food but portions seem smaller now.", 0.2), (2, "Order was wrong and delivery was very late. Losing my patience.", -0.5)],
            },
            {
                "name": "Diana Prince", "trajectory": "cooling",
                "emails": [
                    ("Lovely evening", "Had a wonderful dinner with friends last night. The meze platter was excellent!", 0.7, 0.25, 0.75),
                    ("Price increase", "I noticed prices went up quite a bit. The same meze platter is 30% more expensive now. Just wondering what changed?", 0.0, 0.6, 0.55),
                    ("Reservation issue", "We had a reservation for 7pm but our table wasn't ready until 7:30. No apology was offered. That's not the experience I'm used to.", -0.35, 0.75, 0.4),
                    ("Reconsidering", "To be honest, between the price increases and the declining service, I'm starting to look at other options. Thought you should know.", -0.7, 0.8, 0.35),
                ],
                "maps_reviews": [(4, "Food is still good but prices have gone up significantly. Not sure it's worth it anymore.", 0.0), (3, "Service has declined noticeably. Had to wait 20 minutes just to get our drinks.", -0.4)],
                "food_reviews": [(3, "Food was okay but overpriced for what you get.", -0.1), (2, "Delivery took over an hour. Food was cold and soggy.", -0.55)],
            },
            {
                "name": "Evan Wright", "trajectory": "cooling",
                "emails": [
                    ("Great start!", "Just discovered your restaurant and I'm hooked! The iskender was phenomenal.", 0.8, 0.2, 0.8),
                    ("Quick question", "Is the iskender sauce recipe changed? It tasted different last time. Still good, just different.", 0.15, 0.5, 0.5),
                    ("Feedback", "The last few visits haven't been great. Long waits, inconsistent food quality. I hope this is temporary.", -0.3, 0.65, 0.4),
                    ("Complaint", "Found a hair in my salad yesterday. The waiter didn't seem to care much. Very unhygienic and unprofessional.", -0.75, 0.85, 0.2),
                ],
                "maps_reviews": [(5, "Amazing iskender! Best in the area by far.", 0.85), (3, "Quality has been inconsistent lately. Some days great, some days not.", -0.1), (2, "Hygiene issues and indifferent staff. Not the same place anymore.", -0.6)],
                "food_reviews": [(5, "Iskender was perfect! Generous portions and authentic taste.", 0.85), (3, "Food was okay but not as good as it used to be.", -0.1), (1, "Found something in my food. Done ordering from here.", -0.85)],
            },
            {
                "name": "Kevin Park", "trajectory": "cooling",
                "emails": [
                    ("Recommendation", "A friend recommended your place and we were not disappointed! Everything was delicious.", 0.75, 0.25, 0.75),
                    ("Noise level", "Visited again but it was incredibly noisy. We could barely hear each other. Maybe some sound dampening would help?", 0.0, 0.5, 0.5),
                    ("Staff attitude", "The waiter tonight seemed annoyed that we asked for modifications to our order. Not a great feeling when you're paying for a meal.", -0.45, 0.7, 0.35),
                ],
                "maps_reviews": [(4, "Good food but the restaurant is way too noisy on weekends.", 0.2), (3, "Staff attitude has gone downhill. Food saves it from a lower rating.", -0.2)],
                "food_reviews": [(4, "Tasty food, reasonable delivery time.", 0.5), (2, "Order was missing items and customer service was unhelpful.", -0.5)],
            },
            {
                "name": "Laura Palmer", "trajectory": "cooling",
                "emails": [
                    ("Great find!", "So glad we found your restaurant! The baklava is the best I've had outside of Istanbul!", 0.85, 0.2, 0.8),
                    ("Suggestion", "Love the food but the menu hasn't changed in months. Would be nice to see some seasonal specials or new dishes.", 0.15, 0.45, 0.55),
                    ("Disappointing visit", "Our dinner last night was below your usual standard. The meat was overcooked and the service was rushed. We felt like we were being pushed out.", -0.5, 0.7, 0.35),
                    ("No response?", "I sent an email last week about our bad experience and never heard back. The lack of response says a lot about how much you value customer feedback.", -0.7, 0.85, 0.2),
                ],
                "maps_reviews": [(5, "Incredible baklava and Turkish coffee. A hidden gem!", 0.85), (3, "Menu is getting stale and the last visit was disappointing.", -0.2), (2, "Overcooked food and rushed service. They clearly don't care about quality anymore.", -0.6)],
                "food_reviews": [(5, "Amazing baklava! Order the pistachio one, you won't regret it.", 0.85), (2, "Food quality has dropped. The last order was barely edible.", -0.55)],
            },
            {
                "name": "Hannah Montana", "trajectory": "sudden_drop",
                "emails": [
                    ("Love the new menu!", "Everything on the new menu is incredible! We tried four different dishes and loved them all.", 0.85, 0.2, 0.85),
                    ("Great night out", "Thank you for a wonderful evening. The live music on Friday nights is a great addition!", 0.8, 0.25, 0.75),
                    ("FOOD POISONING", "I am writing to inform you that my husband and I both got severe food poisoning after eating at your restaurant on Saturday. We had to visit the emergency room. This is completely unacceptable and I am considering legal action.", -0.95, 0.9, 0.3),
                ],
                "maps_reviews": [(5, "Love the new menu and the Friday night live music! Perfect date spot.", 0.85), (1, "Got food poisoning. Ended up in the ER. Health department has been notified. AVOID.", -0.95)],
                "food_reviews": [(5, "Perfect food, perfect delivery. Our go-to restaurant!", 0.85), (1, "DO NOT ORDER. Made us seriously ill. Reported to health authorities.", -0.95)],
            },
            {
                "name": "Ian Somerhalder", "trajectory": "sudden_drop",
                "emails": [
                    ("Regular here!", "Just wanted to say we come here every week and it never disappoints. You guys are consistent!", 0.8, 0.3, 0.7),
                    ("RUDE MANAGER", "Your manager yelled at my wife tonight because she politely asked for a table change. We were humiliated in front of the entire restaurant. We will NEVER come back. Expect a review.", -0.9, 0.85, 0.3),
                ],
                "maps_reviews": [(5, "Our weekly spot! Always consistent and friendly.", 0.8), (1, "Manager screamed at my wife for asking to change tables. Worst experience ever. AVOID this place.", -0.95)],
                "food_reviews": [(5, "Reliable weekly order. Never had a problem!", 0.8), (1, "After what happened to us at the restaurant, we'll never order from here again.", -0.85)],
            },
            {
                "name": "Jenny Block", "trajectory": "sudden_drop",
                "emails": [
                    ("Food poisoning", "I ate at your restaurant last night and have been violently ill ever since. The chicken was completely undercooked.", -0.9, 0.7, 0.5),
                    ("Allergic reaction", "I need to bring something very serious to your attention. I clearly stated my peanut allergy when ordering today, yet my dish contained peanuts. I had a severe allergic reaction and had to use my EpiPen. This is life-threatening negligence.", -0.95, 0.9, 0.35),
                    ("Legal action", "Since you haven't bothered to respond to my previous emails regarding the peanut allergy incident, my lawyer will be contacting you.", -0.95, 0.95, 0.2),
                ],
                "maps_reviews": [(1, "Gave me terrible food poisoning. Raw chicken.", -0.9), (1, "Nearly killed me by ignoring my clearly stated peanut allergy. Dangerous negligence.", -0.95)],
                "food_reviews": [(1, "DO NOT EAT HERE. Served me raw chicken and ignored food allergies.", -0.95), (1, "LIFE-THREATENING: Ignored peanut allergy despite being told multiple times.", -0.95)],
            },
            {
                "name": "Mike Ehrmantraut", "trajectory": "sudden_drop",
                "emails": [
                    ("Terrible first impression", "My first time here and it was awful. The food was cold and the waiter was incredibly rude. I expected much better.", -0.8, 0.5, 0.5),
                    ("Overcharged", "I just checked my credit card statement and I was charged 3 times for the same meal. I've been trying to call your restaurant for 2 days and nobody picks up. Fix this immediately or I'm disputing through my bank.", -0.95, 0.9, 0.3),
                    ("Still waiting", "It has been a week and no response. You are thieves. I am reporting you to the Better Business Bureau and my bank is doing a chargeback.", -0.95, 0.95, 0.2),
                ],
                "maps_reviews": [(1, "Worst experience ever. Cold food, rude staff. Avoid.", -0.8), (1, "Charged my card THREE times and then ghosted me when I tried to resolve it. Thieves.", -0.95)],
                "food_reviews": [(1, "Food arrived cold and 2 hours late. Never again.", -0.8), (1, "Billing fraud. Charged multiple times and won't answer the phone.", -0.95)],
            },
            {
                "name": "Oscar Wilde", "trajectory": "sudden_drop",
                "emails": [
                    ("Charming place", "What a delightful little restaurant! The decor is tasteful and the food matches the ambiance perfectly. The kunefe was divine.", 0.8, 0.35, 0.8),
                    ("Second visit", "Another wonderful evening. Your chef has a real talent. The lamb chops were exquisite.", 0.75, 0.3, 0.7),
                    ("Cockroach", "I am utterly horrified. A live cockroach crawled across our table during dinner tonight. When we alerted the staff, they tried to brush it off as if it were nothing. I have photos and will be sharing them online. This is a health code violation.", -0.9, 0.85, 0.35),
                ],
                "maps_reviews": [(5, "Charming atmosphere and divine kunefe. A real hidden gem.", 0.85), (5, "The lamb chops are worth the trip alone. Beautifully prepared.", 0.8), (1, "COCKROACH ON THE TABLE. Staff didn't care. Photos available. Reported to health department.", -0.95)],
                "food_reviews": [(5, "Exquisite kunefe delivered perfectly. Arrived warm and crispy.", 0.85), (1, "After seeing the hygiene conditions in person, I wouldn't trust food delivered from here.", -0.85)],
            },
        ]

        platforms = ["Uber Eats", "DoorDash", "Grubhub", "Postmates"]
        food_items = [
            "Cheeseburger, Fries, Cola", "Pepperoni Pizza, Garlic Knots", "Fried Chicken, Mac & Cheese", 
            "BBQ Ribs, Coleslaw", "Burrito Bowl, Chips & Guac", "Avocado Toast, Iced Latte", 
            "Caesar Salad, Iced Tea", "Sushi Platter, Miso Soup", "Pancakes, Bacon, Coffee", 
            "Steak Frites, Red Wine"
        ]

        for idx, data in enumerate(customers_data):
            c = Customer(
                name=data["name"],
                email=f"{data['name'].split()[0].lower()}@example.com",
                phone=f"+1555{random.randint(100000, 999999)}",
                first_interaction=datetime.utcnow() - timedelta(days=180)
            )
            db_session.add(c)
            db_session.flush()

            now = datetime.utcnow()
            num_emails = max(1, len(data["emails"]))
            for i, (subj, body, sent, form, length) in enumerate(data["emails"]):
                days_ago = 145 - int(i * (120 / num_emails)) + random.randint(-4, 4)
                days_ago = max(4, days_ago)
                email_time = now - timedelta(days=days_ago, hours=random.randint(9, 21), minutes=random.randint(0, 59))
                em = EmailMessage(
                    customer_id=c.id,
                    direction="inbound",
                    subject=subj,
                    body=body,
                    sent_at=email_time,
                    sentiment_score=sent,
                    tone_formality=form,
                    tone_length_trend=length,
                    analysis_reason="Static analysis",
                    analyzed_at=now
                )
                db_session.add(em)
                reply = EmailMessage(
                    customer_id=c.id,
                    direction="outbound",
                    subject="Re: " + subj,
                    body="Thank you for reaching out. We value your feedback and will look into this. Please don't hesitate to contact us for anything.",
                    sent_at=email_time + timedelta(hours=random.randint(1, 6), minutes=random.randint(10, 50)),
                    sentiment_score=0.3,
                    tone_formality=0.5,
                    tone_length_trend=0.5,
                    analysis_reason="Standard business reply",
                    analyzed_at=now
                )
                db_session.add(reply)

            num_maps = max(1, len(data.get("maps_reviews", [])))
            for i, (rating, text, sent) in enumerate(data.get("maps_reviews", [])):
                days_ago = 135 - int(i * (110 / num_maps)) + random.randint(-5, 5)
                days_ago = max(3, days_ago)
                review_time = now - timedelta(days=days_ago, hours=random.randint(11, 23), minutes=random.randint(3, 57))
                mr = MapsReview(
                    customer_id=c.id,
                    place_id="ChIJ_demo_place_id_001",
                    author_name=data["name"],
                    rating=rating,
                    text=text,
                    review_date=review_time,
                    sentiment_score=sent,
                    analysis_reason="Static analysis",
                    analyzed_at=now,
                    is_synthetic=True
                )
                db_session.add(mr)

            num_food = max(1, len(data.get("food_reviews", [])))
            for i, (rating, text, sent) in enumerate(data.get("food_reviews", [])):
                days_ago = 125 - int(i * (100 / num_food)) + random.randint(-5, 5)
                days_ago = max(2, days_ago)
                review_time = now - timedelta(days=days_ago, hours=random.randint(12, 22), minutes=random.randint(1, 58))
                fr = FoodPlatformReview(
                    customer_id=c.id,
                    platform_name=platforms[idx % len(platforms)],
                    rating=rating,
                    text=text,
                    review_date=review_time,
                    order_items=random.choice(food_items),
                    sentiment_score=sent,
                    analysis_reason="Static analysis",
                    analyzed_at=now
                )
                db_session.add(fr)

            traj = data.get("trajectory", "happy")
            history_days = [150, 120, 90, 60, 30]
            for step_idx, days_ago in enumerate(history_days):
                hist_date = now - timedelta(days=days_ago, hours=random.randint(2, 12), minutes=random.randint(0, 59))
                if traj == "happy":
                    sc = round(0.85 + step_idx * 0.02, 3)
                    em_sc, map_sc, fd_sc = round(sc - 0.03, 3), round(sc + 0.02, 3), round(sc, 3)
                elif traj == "cooling":
                    sc = round(0.88 - step_idx * 0.09, 3)
                    em_sc, map_sc, fd_sc = round(sc - 0.02, 3), round(sc + 0.03, 3), round(sc, 3)
                elif traj == "sudden_drop":
                    sc = round(0.91 + (0.01 if step_idx % 2 == 0 else -0.01), 3)
                    em_sc, map_sc, fd_sc = round(sc - 0.01, 3), round(sc + 0.02, 3), round(sc, 3)
                else:
                    sc = round(0.75 - step_idx * 0.03, 3)
                    em_sc, map_sc, fd_sc = round(sc, 3), round(sc, 3), round(sc, 3)

                rs = RiskScore(
                    customer_id=c.id,
                    score=sc,
                    email_score=em_sc,
                    maps_score=map_sc,
                    food_score=fd_sc,
                    reason=f"Historical record ({traj} trend)",
                    calculated_at=hist_date
                )
                db_session.add(rs)

        db_session.commit()
