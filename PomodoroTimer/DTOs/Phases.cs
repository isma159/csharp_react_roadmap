using System.Runtime.Serialization;

namespace PomodoroTimer;

public enum Phases
{
    WORK,
    [EnumMember(Value = "LONG-BREAK")]
    LONGBREAK,
    [EnumMember(Value = "SHORT-BREAK")]
    SHORTBREAK
}