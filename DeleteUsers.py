from AccountBackend import app, db, User

with app.app_context():  
    users = User.query.all()
    print(f"Users before deletion: {len(users)}") 

    db.session.query(User).delete()  
    db.session.commit()  
    db.session.close()
    
    users_after = User.query.all()
    print(f"Users after deletion: {len(users_after)}")
