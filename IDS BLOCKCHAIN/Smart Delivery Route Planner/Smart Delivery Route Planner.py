import math

def calculate_distance(point1, point2):
    """Calculate Euclidean distance between two points."""
    return math.sqrt((point1[0] - point2[0])**2 + (point1[1] - point2[1])**2)

def optimize_delivery_route(locations, priorities):
    """Optimize delivery route based on priorities and minimize total travel distance."""
    # Priority levels for sorting
    priority_map = {"high": 1, "medium": 2, "low": 3}

    # Combine locations and priorities
    deliveries = list(zip(locations, priorities))

    # Sort deliveries by priority while maintaining input order for same priorities
    deliveries.sort(key=lambda x: priority_map[x[1]])

    # Initialize variables
    optimized_route = []
    total_distance = 0
    current_location = (0, 0)  # Start at the origin

    # Calculate the route and total distance
    for location, _ in deliveries:
        optimized_route.append(location)
        total_distance += calculate_distance(current_location, location)
        current_location = location

    return optimized_route, round(total_distance, 2)

# Example Input
locations = [(0, 0), (2, 3), (5, 1), (6, 4), (1, 2)]
priorities = ["high", "medium", "high", "low", "medium"]

# Call the function
optimized_route, total_distance = optimize_delivery_route(locations, priorities)

# Output
print("Optimized Route:", optimized_route)
print("Total Distance:", total_distance)
