# Diagrams

Create diagrams using Mermaid syntax.

## Flowchart

```mermaid
graph TD
    A[Start] --> B{Is it working?}
    B -->|Yes| C[Great!]
    B -->|No| D[Debug]
    D --> B
    C --> E[End]
```

## Sequence Diagram

```mermaid
sequenceDiagram
    participant User
    participant Frontend
    participant Backend
    participant Database
    
    User->>Frontend: Click button
    Frontend->>Backend: API request
    Backend->>Database: Query data
    Database-->>Backend: Return results
    Backend-->>Frontend: JSON response
    Frontend-->>User: Display data
```

## Class Diagram

```mermaid
classDiagram
    class Animal {
        +String name
        +int age
        +makeSound()
    }
    class Dog {
        +String breed
        +bark()
    }
    class Cat {
        +String color
        +meow()
    }
    Animal <|-- Dog
    Animal <|-- Cat
```

## State Diagram

```mermaid
stateDiagram-v2
    [*] --> Idle
    Idle --> Processing: Start
    Processing --> Success: Complete
    Processing --> Error: Fail
    Success --> [*]
    Error --> Idle: Retry
```

## Entity Relationship Diagram

```mermaid
erDiagram
    USER ||--o{ POST : creates
    USER ||--o{ COMMENT : writes
    POST ||--o{ COMMENT : has
    USER {
        int id PK
        string name
        string email
    }
    POST {
        int id PK
        string title
        string content
        int user_id FK
    }
    COMMENT {
        int id PK
        string text
        int post_id FK
        int user_id FK
    }
```

## Gantt Chart

```mermaid
gantt
    title Project Timeline
    dateFormat  YYYY-MM-DD
    section Planning
    Research           :a1, 2024-01-01, 7d
    Design             :a2, after a1, 14d
    section Development
    Frontend           :b1, after a2, 21d
    Backend            :b2, after a2, 28d
    section Testing
    Testing            :c1, after b2, 14d
    section Launch
    Deployment         :d1, after c1, 7d
```

## Pie Chart

```mermaid
pie title Technology Stack
    "Vue.js" : 40
    "TypeScript" : 25
    "Vite" : 20
    "Node.js" : 15
```

## Git Graph

```mermaid
gitGraph
    commit
    commit
    branch develop
    checkout develop
    commit
    commit
    checkout main
    merge develop
    commit
    branch feature
    checkout feature
    commit
    checkout main
    merge feature
```
