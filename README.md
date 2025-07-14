# LMS Frontend Project

This project is a Learning Management System (LMS) frontend built with Next.js, Tailwind CSS, and React.

## Getting Started

First, run the development server:

```bash
   npm run dev
   # or
   yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Database Setup

This project uses PostgreSQL for the database.

### Prerequisites

-   PostgreSQL installed and running.
-   A database created for this project.

### Environment Variables

Create a `.env.local` file in the root of the project and add the following environment variables:

```
DATABASE_URL="postgres://USERNAME:PASSWORD@HOST:PORT/DATABASE_NAME"
JWT_SECRET="YOUR_SUPER_SECRET_JWT_KEY"
```

### Database Schema

Run the following SQL queries in your database to create the required tables.

#### Users Table

```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL CHECK (role IN ('teacher', 'student')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### Courses Table

```sql
CREATE TABLE courses (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### Lectures Table

```sql
CREATE TABLE lectures (
  id SERIAL PRIMARY KEY,
  course_id INTEGER NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  content_url VARCHAR(255),
  is_published BOOLEAN DEFAULT FALSE,
  module VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### Course Enrollments Table

```sql
CREATE TABLE course_enrollments (
  id SERIAL PRIMARY KEY,
  course_id INTEGER NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  student_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  enrolled_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(course_id, student_id)
);
```

#### Lecture Progress Table

```sql
CREATE TABLE lecture_progress (
  id SERIAL PRIMARY KEY,
  lecture_id INTEGER NOT NULL REFERENCES lectures(id) ON DELETE CASCADE,
  student_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  completed_at TIMESTAMP,
  UNIQUE(lecture_id, student_id)
);
```

### Seeding Data

After creating the tables, you'll need to seed them with some initial data.

1.  **Create a Teacher Account**: Register a new user with the `teacher` role through the application's registration page. The system is designed to work with one teacher. Note the `id` of this new user (e.g., `1`).

2.  **Create Student Accounts**: Register a few students through the registration page. Note their `id`s (e.g., `2`, `3`, `4`).

3.  **Seed the Courses**: Run the following SQL to create the three fixed courses.

    ```sql
    INSERT INTO courses (title, description) VALUES 
      ('Grade 1', 'First grade curriculum'),
      ('Grade 2', 'Second grade curriculum'),
      ('Grade 3', 'Third grade curriculum');
    ```

4.  **Seed Lectures**: Add some lectures to the courses.

    ```sql
    -- Lectures for Grade 1 (course_id = 1)
    INSERT INTO lectures (course_id, title, module, is_published, description) VALUES
    (1, 'Introduction to Addition', 'Week 1', TRUE, 'Learning single-digit addition.'),
    (1, 'Basic Subtraction', 'Week 1', TRUE, 'Learning single-digit subtraction.'),
    (1, 'Reading Comprehension', 'Week 2', FALSE, 'Developing reading skills.');

    -- Lectures for Grade 2 (course_id = 2)
    INSERT INTO lectures (course_id, title, module, is_published, description) VALUES
    (2, 'Multiplication Basics', 'Week 1', TRUE, 'Introduction to multiplication tables.'),
    (2, 'Division Concepts', 'Week 2', TRUE, 'Understanding the concept of division.');
    ```

5.  **Enroll Students**: Enroll the students you created into the courses.

    ```sql
    -- Enroll student 2 in Grade 1 and Grade 2
    INSERT INTO course_enrollments (student_id, course_id) VALUES (2, 1), (2, 2);
    
    -- Enroll student 3 in Grade 1
    INSERT INTO course_enrollments (student_id, course_id) VALUES (3, 1);

    -- Enroll student 4 in Grade 3
    INSERT INTO course_enrollments (student_id, course_id) VALUES (4, 3);
    ```
    
6.  **Track Lecture Progress**: Mark some lectures as completed for students.

    ```sql
    -- Mark 'Introduction to Addition' (lecture_id=1) as completed for student 2
    INSERT INTO lecture_progress (student_id, lecture_id, completed_at) VALUES (2, 1, NOW());
    ```

## API Endpoints

The API endpoints are defined in `app/api/`. You can test them using a tool like Postman or `curl`. Remember to include the `auth_token` cookie in your requests for authentication.
