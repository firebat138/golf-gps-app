/**
 * COURSE DATA
 * 
 * This file contains golf course definitions.
 * For PHASE 1, we have one test course with placeholder coordinates.
 * 
 * You can easily edit coordinates here and refresh the page.
 * 
 * Each hole has:
 * - holeNumber: 1-18
 * - par: 3, 4, or 5
 * - yardage: total yardage
 * - tee: [longitude, latitude]
 * - greenFront: [longitude, latitude]
 * - greenCenter: [longitude, latitude]
 * - greenBack: [longitude, latitude]
 * 
 * Coordinates are in [longitude, latitude] format (standard for maps).
 * 
 * PLACEHOLDER COORDINATES:
 * These are currently set to a golf course-like pattern.
 * Replace with actual GPS coordinates from your target course.
 */

const COURSES = {
    'test-course': {
        name: 'Test Golf Course',
        location: 'Test Location',
        holes: [
            // HOLE 1 - Southern Delaware Golf Club (real GPS data)
            {
                holeNumber: 1,
                par: 4,
                yardage: 386,
                tee: [-75.40679047551636, 38.90084010013353],
                greenFront: [-75.4103126089722, 38.89963382905633],
                greenCenter: [-75.4103776110409, 38.899593162885274],
                greenBack: [-75.4104993815484, 38.899544409168094]
            },
            // HOLE 2 - Southern Delaware Golf Club (real GPS data)
            {
                holeNumber: 2,
                par: 4,
                yardage: 386,
                tee: [-75.41110454642197, 38.89862084916154],
                greenFront: [-75.40759766911238, 38.896367251748394],
                greenCenter: [-75.40751467332501, 38.89636246717086],
                greenBack: [-75.40737717802777, 38.896303217742016]
            },
            // HOLE 3 - Southern Delaware Golf Club (real GPS data)
            {
                holeNumber: 3,
                par: 4,
                yardage: 386,
                tee: [-75.4075763944941, 38.895409809127266],
                greenFront: [-75.41061577156366, 38.89751708643028],
                greenCenter: [-75.41070159477704, 38.897607393761156],
                greenBack: [-75.41072280173653, 38.897692711346046]
            },
            // HOLE 4
            {
                holeNumber: 4,
                par: 4,
                yardage: 412,
                tee: [-87.6235, 41.8868],
                greenFront: [-87.6222, 41.8882],
                greenCenter: [-87.6217, 41.8886],
                greenBack: [-87.6212, 41.8889]
            },
            // HOLE 5
            {
                holeNumber: 5,
                par: 4,
                yardage: 395,
                tee: [-87.6212, 41.8889],
                greenFront: [-87.6199, 41.8903],
                greenCenter: [-87.6194, 41.8907],
                greenBack: [-87.6189, 41.8910]
            },
            // HOLE 6
            {
                holeNumber: 6,
                par: 3,
                yardage: 152,
                tee: [-87.6189, 41.8910],
                greenFront: [-87.6182, 41.8918],
                greenCenter: [-87.6177, 41.8922],
                greenBack: [-87.6172, 41.8926]
            },
            // HOLE 7
            {
                holeNumber: 7,
                par: 4,
                yardage: 386,
                tee: [-87.6172, 41.8926],
                greenFront: [-87.6159, 41.8940],
                greenCenter: [-87.6154, 41.8944],
                greenBack: [-87.6149, 41.8947]
            },
            // HOLE 8
            {
                holeNumber: 8,
                par: 5,
                yardage: 542,
                tee: [-87.6149, 41.8947],
                greenFront: [-87.6136, 41.8961],
                greenCenter: [-87.6131, 41.8966],
                greenBack: [-87.6126, 41.8970]
            },
            // HOLE 9
            {
                holeNumber: 9,
                par: 4,
                yardage: 420,
                tee: [-87.6126, 41.8970],
                greenFront: [-87.6113, 41.8984],
                greenCenter: [-87.6108, 41.8988],
                greenBack: [-87.6103, 41.8991]
            },
            // HOLE 10
            {
                holeNumber: 10,
                par: 4,
                yardage: 380,
                tee: [-87.6103, 41.8991],
                greenFront: [-87.6090, 41.9005],
                greenCenter: [-87.6085, 41.9009],
                greenBack: [-87.6080, 41.9012]
            },
            // HOLE 11
            {
                holeNumber: 11,
                par: 3,
                yardage: 168,
                tee: [-87.6080, 41.9012],
                greenFront: [-87.6073, 41.9020],
                greenCenter: [-87.6068, 41.9024],
                greenBack: [-87.6063, 41.9028]
            },
            // HOLE 12
            {
                holeNumber: 12,
                par: 4,
                yardage: 405,
                tee: [-87.6063, 41.9028],
                greenFront: [-87.6050, 41.9042],
                greenCenter: [-87.6045, 41.9046],
                greenBack: [-87.6040, 41.9049]
            },
            // HOLE 13
            {
                holeNumber: 13,
                par: 5,
                yardage: 560,
                tee: [-87.6040, 41.9049],
                greenFront: [-87.6027, 41.9063],
                greenCenter: [-87.6022, 41.9068],
                greenBack: [-87.6017, 41.9072]
            },
            // HOLE 14
            {
                holeNumber: 14,
                par: 3,
                yardage: 140,
                tee: [-87.6017, 41.9072],
                greenFront: [-87.6010, 41.9080],
                greenCenter: [-87.6005, 41.9084],
                greenBack: [-87.6000, 41.9088]
            },
            // HOLE 15
            {
                holeNumber: 15,
                par: 4,
                yardage: 430,
                tee: [-87.6000, 41.9088],
                greenFront: [-87.5987, 41.9102],
                greenCenter: [-87.5982, 41.9106],
                greenBack: [-87.5977, 41.9109]
            },
            // HOLE 16
            {
                holeNumber: 16,
                par: 4,
                yardage: 375,
                tee: [-87.5977, 41.9109],
                greenFront: [-87.5964, 41.9123],
                greenCenter: [-87.5959, 41.9127],
                greenBack: [-87.5954, 41.9130]
            },
            // HOLE 17
            {
                holeNumber: 17,
                par: 3,
                yardage: 175,
                tee: [-87.5954, 41.9130],
                greenFront: [-87.5947, 41.9138],
                greenCenter: [-87.5942, 41.9142],
                greenBack: [-87.5937, 41.9146]
            },
            // HOLE 18
            {
                holeNumber: 18,
                par: 4,
                yardage: 440,
                tee: [-87.5937, 41.9146],
                greenFront: [-87.5924, 41.9160],
                greenCenter: [-87.5919, 41.9164],
                greenBack: [-87.5914, 41.9168]
            }
        ]
    }
};

// Get a specific course
function getCourse(courseId) {
    return COURSES[courseId];
}

// Get a specific hole from a course
function getHole(courseId, holeNumber) {
    const course = getCourse(courseId);
    if (!course) return null;
    return course.holes.find(h => h.holeNumber === holeNumber);
}
