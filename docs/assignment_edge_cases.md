# Assignment Edge Cases

> [!NOTE]
> The Score field appears to be a recent addition to StudentVUE. For some rare edge cases, we do not have data on what the expected value is.

## Normal

GradeCompass points earned: 3<br>
GradeCompass points possible: 4<br>
Included in GradeCompass grade calculations: yes

- Score: "25"
- DisplayScore: "3 out of 4"
- ScoreCalValue: "3"
- ScoreMaxValue: "4"
- Points: "3 / 4"
- Point: "3"
- PointPossible: "4"

## Scaled

GradeCompass points earned: 6<br>
GradeCompass points possible: 8<br>
Included in GradeCompass grade calculations: yes

- Score: "3"
- DisplayScore: "3 out of 4"
- ScoreCalValue: "3"
- ScoreMaxValue: "4"
- Points: "6 / 8"
- Point: "6"
- PointPossible: "8"

## Not Graded

> [!NOTE]
> Recent example needed for when ScoreMaxValue is defined

GradeCompass points earned: undefined<br>
GradeCompass points possible: 4<br>
Included in GradeCompass grade calculations: no

- Score: undefined
- DisplayScore: "Not Graded"
- ScoreCalValue: undefined
- ScoreMaxValue: "4" or undefined
- Points: "4 Points Possible"
- Point: undefined
- PointPossible: undefined

## Not Graded, with undefined points possible

> [!NOTE]
> Recent example needed

GradeCompass points earned: undefined<br>
GradeCompass points possible: undefined<br>
Included in GradeCompass grade calculations: no

- Score: ?
- DisplayScore: "Not Graded"
- ScoreCalValue: undefined
- ScoreMaxValue: undefined
- Points: "Points Possible"
- Point: undefined
- PointPossible: undefined

## Zero, with empty Point

> [!NOTE]
> Recent example needed

GradeCompass points earned: 0<br>
GradeCompass points possible: 4<br>
Included in GradeCompass grade calculations: yes

- Score: ?
- DisplayScore: "0 out of 4"
- ScoreCalValue: "0"
- ScoreMaxValue: "4"
- Points: " / 4"
- Point: ""
- PointPossible: "4"

## Extra Credit

GradeCompass points earned: 3<br>
GradeCompass points possible: shown as 4, calculated as 0<br>
Included in GradeCompass grade calculations: yes

- Score: "3"
- DisplayScore: "3 out of 4"
- ScoreCalValue: "3"
- ScoreMaxValue: "4"
- Points: "3 / "
- Point: "3"
- PointPossible: ""

## Not For Grading

> [!NOTE]
> Recent example needed

GradeCompass points earned: 3<br>
GradeCompass points possible: 4<br>
Included in GradeCompass grade calculations: no

- Score: ?
- DisplayScore: "3 out of 4"
- ScoreCalValue: "3"
- ScoreMaxValue: "4"
- Points: "3 / 4"
- Point: "3"
- PointPossible: "4"
- Notes: "(Not For Grading) "
