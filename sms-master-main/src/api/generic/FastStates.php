<?php

namespace Carterline42\Generic;

enum FastStates: int
{
	case DIED 						  = -1;
	case STARTING 					  = 0;
	case RESUMING 					  = 1;
	case PREPARING_ADVICES			  = 2;
	case PREPARING_NUMBERS 			  = 3;
	case ASSIGNING_ADVICES_TO_NUMBERS = 4;
	case SENDING 					  = 5;
	case SLEEPING_NO_TARGETS		  = 6;
	case SLEEPING_NO_ADV_TEXT		  = 7;
	case SLEEPING_NIGHT_TIME		  = 8;
};

?>